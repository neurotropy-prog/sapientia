/**
 * /api/mapa/[hash]/reevaluacion — POST
 *
 * Recibe nuevos valores de sliders (1-10), calcula scores,
 * compara con originales, almacena en map_evolution.reevaluations[].
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { computeEvolutionState, type MapEvolutionData, type ReevaluationEntry } from '@/lib/map-evolution'

/**
 * Convierte un valor de slider (1-10) a score (0-100).
 * Misma lógica que en scoring.ts para P7.
 */
function sliderToScore(val: number): number {
  return Math.round(((val - 1) / 9) * 100)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
): Promise<NextResponse> {
  const { hash } = await params

  let body: { sliders: Record<string, number>; daysSinceCreation: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { sliders, daysSinceCreation } = body
  if (!sliders || typeof sliders !== 'object') {
    return NextResponse.json({ error: 'Sliders requeridos' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('diagnosticos')
    .select('created_at, map_evolution')
    .eq('hash', hash)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Diagnóstico no encontrado' }, { status: 404 })
  }

  const mapEvolution = data.map_evolution as MapEvolutionData

  // Verificar que reevaluación está desbloqueada
  const evolution = computeEvolutionState(data.created_at, mapEvolution)
  if (!evolution.reevaluation.unlocked && !evolution.nextQuarterlyUnlocked) {
    return NextResponse.json({ error: 'Reevaluación no desbloqueada' }, { status: 403 })
  }

  // Calcular nuevos scores
  const newScores = {
    global: Math.round(
      (sliderToScore(sliders.d1 ?? 5) * 0.30) +
      (sliderToScore(sliders.d2 ?? 5) * 0.20) +
      (sliderToScore(sliders.d3 ?? 5) * 0.20) +
      (sliderToScore(sliders.d4 ?? 5) * 0.15) +
      (sliderToScore(sliders.d5 ?? 5) * 0.15)
    ),
    d1: sliderToScore(sliders.d1 ?? 5),
    d2: sliderToScore(sliders.d2 ?? 5),
    d3: sliderToScore(sliders.d3 ?? 5),
    d4: sliderToScore(sliders.d4 ?? 5),
    d5: sliderToScore(sliders.d5 ?? 5),
  }

  // Crear entry de reevaluación
  const entry: ReevaluationEntry = {
    day: daysSinceCreation,
    date: new Date().toISOString(),
    scores: newScores,
  }

  const existingReevals = mapEvolution.reevaluations ?? []

  const updatedEvolution = {
    ...mapEvolution,
    reevaluation_completed: true,
    reevaluation_scores: newScores,
    reevaluations: [...existingReevals, entry],
  }

  const { error: updateError } = await supabase
    .from('diagnosticos')
    .update({ map_evolution: updatedEvolution })
    .eq('hash', hash)

  if (updateError) {
    console.error('[reevaluacion] Update error:', updateError)
    return NextResponse.json({ error: 'Error actualizando' }, { status: 500 })
  }

  return NextResponse.json({ newScores })
}
