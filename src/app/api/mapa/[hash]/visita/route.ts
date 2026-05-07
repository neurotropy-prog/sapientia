/**
 * PATCH /api/mapa/[hash]/visita
 *
 * Registra la fecha de última visita en diagnosticos.meta.last_visited_at
 * y marca secciones de evolución como "viewed" (para quitar badges NUEVO).
 * Se llama desde MapaClient en cada visita (fire-and-forget).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { computeEvolutionState, type MapEvolutionData } from '@/lib/map-evolution'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params
  if (!hash) return NextResponse.json({ ok: false }, { status: 400 })

  try {
    const supabase = createAdminClient()

    // Leer meta, funnel y map_evolution actual
    const { data } = await supabase
      .from('diagnosticos')
      .select('meta, funnel, map_evolution, created_at')
      .eq('hash', hash)
      .single<{
        meta: Record<string, unknown>
        funnel: Record<string, unknown> | null
        map_evolution: MapEvolutionData
        created_at: string
      }>()

    if (!data) return NextResponse.json({ ok: false }, { status: 404 })

    const currentMeta = data.meta ?? {}
    const mapEvolution = data.map_evolution

    // Calcular qué secciones están desbloqueadas
    const evolution = computeEvolutionState(data.created_at, mapEvolution)

    // Marcar como viewed las secciones desbloqueadas que no lo estaban
    const updatedEvolution = { ...mapEvolution }
    let changed = false

    if (evolution.archetype.unlocked && !mapEvolution.archetype_viewed) {
      updatedEvolution.archetype_viewed = true
      changed = true
    }
    if (evolution.insightD7.unlocked && !mapEvolution.insight_d7_viewed) {
      updatedEvolution.insight_d7_viewed = true
      changed = true
    }
    if (evolution.bookExcerpt.unlocked && !mapEvolution.book_excerpt_viewed) {
      updatedEvolution.book_excerpt_viewed = true
      changed = true
    }

    // Incrementar map_visits en funnel
    const currentFunnel = data.funnel ?? {}
    const currentVisits = typeof currentFunnel.map_visits === 'number' ? currentFunnel.map_visits : 0
    const now = new Date().toISOString()

    const updatePayload: Record<string, unknown> = {
      meta: {
        ...currentMeta,
        last_visited_at: now,
      },
      funnel: {
        ...currentFunnel,
        map_visits: currentVisits + 1,
        map_last_visit: now,
      },
    }

    if (changed) {
      updatePayload.map_evolution = updatedEvolution
    }

    await supabase
      .from('diagnosticos')
      .update(updatePayload)
      .eq('hash', hash)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
