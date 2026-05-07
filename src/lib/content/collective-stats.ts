/**
 * collective-stats.ts — Datos colectivos para bisagra e insights del mapa
 *
 * Baseline: 25.000 evaluaciones reales de Neurotropy.
 * Se usa este hardcoded hasta que haya > 100 diagnósticos propios,
 * momento en el que se calculan en tiempo real desde Supabase.
 */

// ─── BASELINE HARDCODEADO (25K evaluaciones Neurotropy) ────────────────────────

export const COLLECTIVE_BASELINE = {
  totalEvaluations: 25000,
  benchmark: 72,
  byDimension: {
    d1: { mean: 68, p25: 52, p75: 82 },
    d2: { mean: 65, p25: 48, p75: 80 },
    d3: { mean: 71, p25: 56, p75: 84 },
    d4: { mean: 69, p25: 53, p75: 83 },
    d5: { mean: 66, p25: 50, p75: 81 },
  },
  patterns: {
    // "X% de personas con tu patrón..."
    sleepDisrupted: 73,         // % con sueño comprometido
    cognitiveOverload: 68,      // % con >2 síntomas cognitivos
    emotionalFlattening: 41,    // % con anestesia emocional
    joyDeficit: 58,             // % con alegría < 50
    chronicDuration: 62,        // % con >1 año de duración
    denialFlag: 34,             // % con "puedo con todo"
    actWeek1: 38,               // % que actúa en semana 1
    actWeek2Plus: 27,           // % que actúa en semana 2+
    neverAct: 35,               // % que nunca actúa
    reevaluationImprovement: 23, // % de mejora media a 30 días
  },
} as const

// ─── TIPOS ──────────────────────────────────────────────────────────────────

export interface CollectiveStats {
  totalEvaluations: number
  benchmark: number
  byDimension: Record<string, { mean: number; p25: number; p75: number }>
  patterns: Record<string, number>
  source: 'hardcoded' | 'realtime'
}

// ─── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────────────

/**
 * Devuelve stats colectivos. Si hay datos reales con volumen > 100,
 * los usa; si no, devuelve el baseline hardcodeado.
 */
export function getCollectiveStats(
  realData?: { count: number; stats: CollectiveStats } | null
): CollectiveStats {
  if (realData && realData.count >= 100) {
    return { ...realData.stats, source: 'realtime' }
  }

  return {
    ...COLLECTIVE_BASELINE,
    source: 'hardcoded',
  }
}

/**
 * Genera un insight personalizado comparando el score del usuario
 * con el benchmark colectivo.
 */
export function getCollectiveComparison(
  userScore: number,
  dimension?: string,
): string {
  const stats = getCollectiveStats()
  const benchmark = dimension
    ? (stats.byDimension[dimension]?.mean ?? stats.benchmark)
    : stats.benchmark

  const diff = benchmark - userScore

  if (diff > 20) {
    return `Tu resultado está ${diff} puntos por debajo de la media de ${stats.totalEvaluations.toLocaleString('es-ES')} evaluaciones.`
  }
  if (diff > 10) {
    return `El ${stats.patterns.sleepDisrupted}% de personas con tu patrón reportan síntomas similares.`
  }
  if (diff > 0) {
    return `Estás cerca de la media colectiva (${benchmark}).`
  }
  return `Tu resultado está por encima de la media colectiva (${benchmark}).`
}
