/**
 * /api/admin/fast-forward — POST
 *
 * Herramienta de testing: retrocede created_at N días para simular
 * paso del tiempo y verificar desbloqueos de evolución.
 *
 * Protegido con Supabase Auth (verifyAdmin).
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase'
import { computeEvolutionState, type MapEvolutionData } from '@/lib/map-evolution'

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Auth
  const cookieStore = await cookies()
  const { authorized, status } = await verifyAdmin(cookieStore)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  let body: { hash: string; daysToAdd?: number; targetDay?: number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { hash, daysToAdd, targetDay } = body
  if (!hash) {
    return NextResponse.json({ error: 'hash requerido' }, { status: 400 })
  }
  if (typeof daysToAdd !== 'number' && typeof targetDay !== 'number') {
    return NextResponse.json({ error: 'daysToAdd o targetDay requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Obtener created_at actual
  const { data, error } = await supabase
    .from('diagnosticos')
    .select('created_at, map_evolution')
    .eq('hash', hash)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Diagnóstico no encontrado' }, { status: 404 })
  }

  let newCreatedAt: Date
  const currentCreatedAt = new Date(data.created_at)

  if (typeof targetDay === 'number') {
    // Modo absoluto: created_at = now - targetDay días
    newCreatedAt = new Date(Date.now() - targetDay * 86400000)
  } else {
    // Modo relativo (legacy): retroceder daysToAdd días
    newCreatedAt = new Date(currentCreatedAt.getTime() - (daysToAdd ?? 0) * 86400000)
  }

  // Reset ALL progression flags so the simulation shows a clean state for the target day.
  // Mark content from EARLIER days as viewed, leave the target day's content as new.
  // Also reset interactive data (subdimensions, reevaluations) to prevent stale data leakage.
  const targetDayActual = typeof targetDay === 'number' ? targetDay : Math.floor((Date.now() - newCreatedAt.getTime()) / 86400000)
  const updatedEvolution = { ...(data.map_evolution as Record<string, unknown>) }

  // Day 0: archetype
  updatedEvolution.archetype_viewed = targetDayActual > 0
  updatedEvolution.archetype_unlocked = true
  // Day 1: fears_needs
  updatedEvolution.fears_needs_viewed = targetDayActual > 1
  updatedEvolution.fears_needs_unlocked = targetDayActual >= 1
  // Day 3: priorityDeep (reuses insight_d7_viewed)
  updatedEvolution.insight_d7_viewed = targetDayActual > 3
  updatedEvolution.insight_d7_unlocked = targetDayActual >= 7
  // Day 6: book_excerpt
  updatedEvolution.book_excerpt_viewed = targetDayActual > 6
  updatedEvolution.book_excerpt_unlocked = targetDayActual >= 6

  // Reset interactive progression data — prevents stale data from previous simulations
  updatedEvolution.subdimensions_completed = false
  updatedEvolution.subdimension_responses = null
  updatedEvolution.reevaluation_scores = null
  updatedEvolution.reevaluations = []
  updatedEvolution.reevaluation_unlocked = targetDayActual >= 10
  updatedEvolution.reevaluation_completed = false
  updatedEvolution.session_booked = false

  const { error: updateError } = await supabase
    .from('diagnosticos')
    .update({
      created_at: newCreatedAt.toISOString(),
      map_evolution: updatedEvolution,
    })
    .eq('hash', hash)

  if (updateError) {
    console.error('[fast-forward] Update error:', updateError)
    return NextResponse.json({ error: 'Error actualizando' }, { status: 500 })
  }

  // Calcular el nuevo estado de evolución con los flags actualizados
  const evolution = computeEvolutionState(
    newCreatedAt.toISOString(),
    updatedEvolution as MapEvolutionData,
  )

  return NextResponse.json({
    previousCreatedAt: currentCreatedAt.toISOString(),
    newCreatedAt: newCreatedAt.toISOString(),
    daysSinceCreation: evolution.daysSinceCreation,
    evolution: {
      archetype: evolution.archetype.unlocked,
      fearsNeeds: evolution.fearsNeeds.unlocked,
      priorityDeep: evolution.priorityDeep.unlocked,
      bookExcerpt: evolution.bookExcerpt.unlocked,
      evolution: evolution.evolution.unlocked,
      nextQuarterly: evolution.nextQuarterlyUnlocked,
    },
  })
}
