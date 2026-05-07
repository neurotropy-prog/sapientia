/**
 * map-evolution.ts — Lógica de desbloqueo temporal del mapa vivo
 *
 * Función pura que calcula qué secciones están desbloqueadas basándose
 * en la fecha de creación del diagnóstico y el estado actual de map_evolution.
 *
 * Sin side effects. El servidor la llama en cada carga de página.
 * El parámetro `now` permite fast-forward para testing.
 */

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface MapEvolutionData {
  archetype_unlocked: boolean
  archetype_viewed: boolean
  fears_needs_unlocked: boolean
  fears_needs_viewed: boolean
  // Legacy fields (kept for backward compatibility with existing records)
  insight_d7_unlocked: boolean
  insight_d7_viewed: boolean
  session_unlocked: boolean
  session_booked: boolean
  subdimensions_unlocked: boolean
  subdimensions_completed: boolean
  subdimension_responses: Record<string, string> | null
  book_excerpt_unlocked: boolean
  book_excerpt_viewed: boolean
  reevaluation_unlocked: boolean
  reevaluation_completed: boolean
  reevaluation_scores: ReevaluationScores | null
  reevaluations: ReevaluationEntry[]
  // Email tracking flags — new timeline: d0, d1, d3, d6, d10, d30, d90
  email_d1_sent?: boolean
  email_d3_sent?: boolean
  email_d6_sent?: boolean
  email_d10_sent?: boolean
  email_d30_sent?: boolean
  email_d90_sent?: string[] // ISO dates of sent d90 emails
  // Legacy email flags (kept for backward compat, no longer sent)
  email_d7_sent?: boolean
  email_d14_sent?: boolean
  email_d21_sent?: boolean
  // Open tracking & suppression
  email_opens?: Record<string, string> // key = email key (d0, d1, d3...), value = ISO date
  consecutive_unopened?: number // resets to 0 on any open
  email_unsubscribed?: boolean
  email_goodbye_sent?: boolean
}

export interface ReevaluationScores {
  global: number
  d1: number
  d2: number
  d3: number
  d4: number
  d5: number
}

export interface ReevaluationEntry {
  day: number
  date: string // ISO
  scores: ReevaluationScores
}

export interface EvolutionSection {
  unlocked: boolean
  viewed: boolean
  isNew: boolean // unlocked && !viewed → muestra badge
}

export interface EvolutionState {
  daysSinceCreation: number
  archetype: EvolutionSection
  fearsNeeds: EvolutionSection
  priorityDeep: EvolutionSection
  bookExcerpt: EvolutionSection
  evolution: EvolutionSection & {
    completed: boolean
    reevaluations: ReevaluationEntry[]
    /** El milestone activo (10, 90, 180...) o null si no hay pendiente */
    activeMilestone: number | null
  }
  // Legacy fields (still computed for backward compat in admin)
  /** @deprecated Use evolution instead */
  insightD7: EvolutionSection
  /** @deprecated Session is always available from D0 */
  session: EvolutionSection & { booked: boolean }
  /** @deprecated Replaced by priorityDeep */
  subdimensions: EvolutionSection & { completed: boolean }
  /** @deprecated Use evolution instead */
  reevaluation: EvolutionSection & {
    completed: boolean
    reevaluations: ReevaluationEntry[]
    activeMilestone: number | null
  }
  /** True si hay una reevaluación trimestral pendiente (día 90, 180, 270...) */
  nextQuarterlyUnlocked: boolean
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const DAY_MS = 86400000

/**
 * Nueva línea temporal de desbloqueo (abril 2026):
 *
 * D0: Archetype (mecanismo de defensa) — se muestra al 93% del gateway + mapa
 * D1: Fears+Needs (miedos + necesidades nucleares)
 * D3: PriorityDeep (profundizamos en tu prioridad nº1)
 * D6: BookExcerpt (extracto del libro)
 * D10: Evolution (tu evolución / primera reevaluación)
 * D90+: Quarterly (reevaluación trimestral)
 */
const UNLOCK_DAYS = {
  archetype: 0,
  fearsNeeds: 1,
  priorityDeep: 3,
  bookExcerpt: 6,
  evolution: 10,
  quarterly: 90,
} as const

// Legacy constants (referenced by old code paths)
const LEGACY_UNLOCK_DAYS = {
  insightD7: 7,
  session: 10,
  subdimensions: 14,
  reevaluation: 30,
} as const

// ─── FUNCIÓN PRINCIPAL ───────────────────────────────────────────────────────

export function computeEvolutionState(
  createdAt: string,
  mapEvolution: MapEvolutionData,
  now?: Date,
): EvolutionState {
  const created = new Date(createdAt).getTime()
  const current = (now ?? new Date()).getTime()
  const daysSinceCreation = Math.floor((current - created) / DAY_MS)

  const daysReached = (days: number) => daysSinceCreation >= days

  // ── Archetype (Día 0) — Mecanismo de defensa adaptativo ───────────────────
  // Siempre desbloqueado desde el D0 (se muestra al 93% del gateway)
  const archetypeUnlocked = daysReached(UNLOCK_DAYS.archetype)
  const archetype: EvolutionSection = {
    unlocked: archetypeUnlocked,
    viewed: mapEvolution.archetype_viewed,
    isNew: archetypeUnlocked && !mapEvolution.archetype_viewed,
  }

  // ── Fears + Needs (Día 1) — Miedos + Necesidades Nucleares ────────────────
  const fearsNeedsUnlocked = daysReached(UNLOCK_DAYS.fearsNeeds)
  const fearsNeeds: EvolutionSection = {
    unlocked: fearsNeedsUnlocked,
    viewed: mapEvolution.fears_needs_viewed ?? false,
    isNew: fearsNeedsUnlocked && !(mapEvolution.fears_needs_viewed ?? false),
  }

  // ── Priority Deep (Día 3) — Profundizamos en tu prioridad nº1 ─────────────
  const priorityDeepUnlocked = daysReached(UNLOCK_DAYS.priorityDeep)
  const priorityDeep: EvolutionSection = {
    unlocked: priorityDeepUnlocked,
    viewed: mapEvolution.insight_d7_viewed, // Reusa campo legacy
    isNew: priorityDeepUnlocked && !mapEvolution.insight_d7_viewed,
  }

  // ── Book Excerpt (Día 6) ──────────────────────────────────────────────────
  const bookUnlocked = daysReached(UNLOCK_DAYS.bookExcerpt)
  const bookExcerpt: EvolutionSection = {
    unlocked: bookUnlocked,
    viewed: mapEvolution.book_excerpt_viewed,
    isNew: bookUnlocked && !mapEvolution.book_excerpt_viewed,
  }

  // ── Evolution (Día 10+) — Tu Evolución / Reevaluaciones ───────────────────
  // Día 10 = primera evolución (antes era reevaluación día 30)
  // Día 90, 180, 270... = trimestrales
  const evolutionUnlocked = daysReached(UNLOCK_DAYS.evolution)
  const allReevaluations = mapEvolution.reevaluations ?? []

  // Milestones de reevaluación: día 10, luego cada 90 días
  const reevalMilestones: number[] = [UNLOCK_DAYS.evolution]
  for (
    let q = UNLOCK_DAYS.quarterly;
    q <= daysSinceCreation;
    q += UNLOCK_DAYS.quarterly
  ) {
    reevalMilestones.push(q)
  }

  // Reevaluaciones completadas (por milestone cercano)
  const completedMilestones = new Set(
    allReevaluations.map((r) => {
      return reevalMilestones.reduce((closest, m) =>
        Math.abs(r.day - m) < Math.abs(r.day - closest) ? m : closest,
      )
    }),
  )

  // La reevaluación activa es el milestone más reciente NO completado
  let activeReevalMilestone: number | null = null
  for (const m of reevalMilestones) {
    if (daysSinceCreation >= m && !completedMilestones.has(m)) {
      activeReevalMilestone = m
    }
  }

  const hasActiveReeval = activeReevalMilestone !== null

  const evolutionState: EvolutionSection & {
    completed: boolean
    reevaluations: ReevaluationEntry[]
    activeMilestone: number | null
  } = {
    unlocked: evolutionUnlocked,
    viewed: evolutionUnlocked && !hasActiveReeval,
    isNew: hasActiveReeval,
    completed: evolutionUnlocked && !hasActiveReeval,
    reevaluations: allReevaluations,
    activeMilestone: activeReevalMilestone,
  }

  // nextQuarterlyUnlocked: hay un milestone activo >= 90
  const nextQuarterlyUnlocked = activeReevalMilestone !== null && activeReevalMilestone >= UNLOCK_DAYS.quarterly

  // ── Legacy fields (backward compat) ──────────────────────────────────────
  const insightD7Unlocked = daysReached(LEGACY_UNLOCK_DAYS.insightD7)
  const insightD7: EvolutionSection = {
    unlocked: insightD7Unlocked,
    viewed: mapEvolution.insight_d7_viewed,
    isNew: insightD7Unlocked && !mapEvolution.insight_d7_viewed,
  }

  const sessionUnlocked = true // Session siempre disponible desde D0
  const session: EvolutionSection & { booked: boolean } = {
    unlocked: sessionUnlocked,
    viewed: false,
    isNew: !mapEvolution.session_booked,
    booked: mapEvolution.session_booked,
  }

  const subdimsUnlocked = daysReached(LEGACY_UNLOCK_DAYS.subdimensions)
  const subdimensions: EvolutionSection & { completed: boolean } = {
    unlocked: subdimsUnlocked,
    viewed: mapEvolution.subdimensions_completed,
    isNew: subdimsUnlocked && !mapEvolution.subdimensions_completed,
    completed: mapEvolution.subdimensions_completed,
  }

  const reevaluation = { ...evolutionState }

  return {
    daysSinceCreation,
    archetype,
    fearsNeeds,
    priorityDeep,
    bookExcerpt,
    evolution: evolutionState,
    // Legacy
    insightD7,
    session,
    subdimensions,
    reevaluation,
    nextQuarterlyUnlocked,
  }
}

// ─── HELPERS PARA EMAILS ─────────────────────────────────────────────────────

/**
 * Devuelve qué emails deben enviarse (unlocked pero no sent).
 *
 * Nueva secuencia (abril 2026):
 *   D1: Miedos + necesidades desbloqueados
 *   D3: Profundizamos en tu prioridad nº1
 *   D6: Extracto del libro disponible
 *   D10: Tu Evolución está lista
 *   D30: Reevaluación mensual
 *   D90+: Reevaluación trimestral
 */
export function getPendingEmails(
  daysSinceCreation: number,
  mapEvolution: MapEvolutionData,
): string[] {
  const pending: string[] = []

  if (daysSinceCreation >= 1 && !mapEvolution.email_d1_sent) pending.push('d1')
  if (daysSinceCreation >= 3 && !mapEvolution.email_d3_sent) pending.push('d3')
  if (daysSinceCreation >= 6 && !mapEvolution.email_d6_sent) pending.push('d6')
  if (daysSinceCreation >= 10 && !mapEvolution.email_d10_sent) pending.push('d10')
  if (daysSinceCreation >= 30 && !mapEvolution.email_d30_sent) pending.push('d30')

  // D90: cada 90 días
  if (daysSinceCreation >= 90) {
    const sentDates = new Set(mapEvolution.email_d90_sent ?? [])
    for (let q = 90; q <= daysSinceCreation; q += 90) {
      const key = `d90_${q}`
      if (!sentDates.has(key)) {
        pending.push(key)
        break // Solo enviar el más reciente pendiente
      }
    }
  }

  return pending
}
