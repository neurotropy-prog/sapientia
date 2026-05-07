/**
 * /api/mapa/[hash]/subdimensions — POST
 *
 * Recibe respuestas de subdimensiones, calcula scores,
 * actualiza map_evolution en Supabase.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { computeEvolutionState, type MapEvolutionData } from '@/lib/map-evolution'
import { getMostCompromised } from '@/lib/insights'
import {
  getSubdimensionConfig,
  computeSubdimensionScores,
} from '@/lib/content/subdimensions'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
): Promise<NextResponse> {
  const { hash } = await params

  let body: { responses: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  if (!body.responses || typeof body.responses !== 'object') {
    return NextResponse.json({ error: 'Respuestas requeridas' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fetch diagnostico
  const { data, error } = await supabase
    .from('diagnosticos')
    .select('scores, created_at, map_evolution')
    .eq('hash', hash)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Diagnóstico no encontrado' }, { status: 404 })
  }

  const mapEvolution = data.map_evolution as MapEvolutionData
  const scores = data.scores as { d1_regulacion: number; d2_sueno: number; d3_claridad: number; d4_emocional: number; d5_alegria: number }

  // Verificar que subdimensiones están desbloqueadas
  const evolution = computeEvolutionState(data.created_at, mapEvolution)
  if (!evolution.priorityDeep.unlocked) {
    return NextResponse.json({ error: 'Subdimensiones no desbloqueadas' }, { status: 403 })
  }

  if (mapEvolution.subdimensions_completed) {
    return NextResponse.json({ error: 'Subdimensiones ya completadas' }, { status: 409 })
  }

  // Calcular subdimensión scores
  const { key: worstKey } = getMostCompromised(
    scores.d1_regulacion, scores.d2_sueno, scores.d3_claridad,
    scores.d4_emocional, scores.d5_alegria,
  )
  const config = getSubdimensionConfig(worstKey)
  const subScores = computeSubdimensionScores(config, body.responses)

  // Actualizar map_evolution
  const updatedEvolution = {
    ...mapEvolution,
    subdimensions_completed: true,
    subdimension_responses: body.responses,
  }

  const { error: updateError } = await supabase
    .from('diagnosticos')
    .update({ map_evolution: updatedEvolution })
    .eq('hash', hash)

  if (updateError) {
    console.error('[subdimensions] Update error:', updateError)
    return NextResponse.json({ error: 'Error actualizando' }, { status: 500 })
  }

  return NextResponse.json({ scores: subScores })
}
