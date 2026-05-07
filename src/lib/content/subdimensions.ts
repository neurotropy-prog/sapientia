/**
 * subdimensions.ts — Subdimensiones y preguntas inline
 *
 * Cada dimensión tiene 2-3 subdimensiones con 2 preguntas de opción múltiple.
 * Las respuestas generan scores de subdimensión que se muestran en el mapa.
 *
 * Todos los textos editables (intro, preguntas, opciones) se obtienen del
 * sistema de Copy centralizado, lo que permite a Javier editarlos desde
 * el panel de admin sin tocar código.
 */

import type { DimensionKey } from '@/lib/insights'
import { getCopySync } from '@/lib/copy-sync'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface SubdimensionDef {
  key: string
  name: string
}

export interface SubdimensionOption {
  key: string
  label: string
  /** Valor de 0 a 100 que contribuye al score de la subdimensión */
  value: number
}

export interface SubdimensionQuestion {
  id: string
  text: string
  /** Qué subdimensión(es) afecta */
  affectsSubdimension: string
  options: SubdimensionOption[]
}

export interface SubdimensionConfig {
  dimensionKey: DimensionKey
  dimensionName: string
  intro: string
  subdimensions: SubdimensionDef[]
  questions: SubdimensionQuestion[]
}

// ─── HELPER ──────────────────────────────────────────────────────────────────

/** Shorthand — resolves a copy key with optional overrides */
const c = (key: string, overrides?: Record<string, string>) =>
  getCopySync(key, overrides)

// ─── BUILDER ─────────────────────────────────────────────────────────────────

/**
 * Builds a SubdimensionConfig dynamically from copy keys.
 * Structure data (subdimension keys, numeric values) stays in code;
 * all user-facing text comes from the copy system.
 */
function buildConfig(
  dk: DimensionKey,
  dimensionName: string,
  subdimensions: SubdimensionDef[],
  questionMeta: Array<{
    id: string
    affectsSubdimension: string
    optionValues: [number, number, number, number]
  }>,
  overrides?: Record<string, string>,
): SubdimensionConfig {
  return {
    dimensionKey: dk,
    dimensionName,
    intro: c(`mapa.subdim.${dk}.intro`, overrides),
    subdimensions,
    questions: questionMeta.map((qm, qi) => {
      const qNum = qi + 1 // q1, q2
      const optKeys = ['A', 'B', 'C', 'D'] as const
      return {
        id: qm.id,
        text: c(`mapa.subdim.${dk}.q${qNum}.text`, overrides),
        affectsSubdimension: qm.affectsSubdimension,
        options: optKeys.map((k, ki) => ({
          key: k,
          label: c(`mapa.subdim.${dk}.q${qNum}.opt${k}`, overrides),
          value: qm.optionValues[ki],
        })),
      }
    }),
  }
}

// ─── STRUCTURE DATA (non-editable) ──────────────────────────────────────────

const STRUCTURE: Record<
  DimensionKey,
  {
    name: string
    subdimensions: SubdimensionDef[]
    questionMeta: Array<{
      id: string
      affectsSubdimension: string
      optionValues: [number, number, number, number]
    }>
  }
> = {
  d1: {
    name: 'Regulación Nerviosa',
    subdimensions: [
      { key: 'd1_activation', name: 'Activación diurna' },
      { key: 'd1_recovery', name: 'Recuperación nocturna' },
      { key: 'd1_stress', name: 'Respuesta al estrés agudo' },
    ],
    questionMeta: [
      { id: 'd1_q1', affectsSubdimension: 'd1_activation', optionValues: [15, 40, 65, 85] },
      { id: 'd1_q2', affectsSubdimension: 'd1_stress', optionValues: [15, 35, 55, 80] },
    ],
  },
  d2: {
    name: 'Calidad de Sueño',
    subdimensions: [
      { key: 'd2_onset', name: 'Conciliación' },
      { key: 'd2_maintenance', name: 'Mantenimiento' },
      { key: 'd2_restorative', name: 'Calidad restaurativa' },
    ],
    questionMeta: [
      { id: 'd2_q1', affectsSubdimension: 'd2_onset', optionValues: [15, 35, 60, 85] },
      { id: 'd2_q2', affectsSubdimension: 'd2_restorative', optionValues: [10, 35, 60, 85] },
    ],
  },
  d3: {
    name: 'Claridad Cognitiva',
    subdimensions: [
      { key: 'd3_focus', name: 'Foco sostenido' },
      { key: 'd3_decisions', name: 'Capacidad de decisión' },
      { key: 'd3_memory', name: 'Memoria operativa' },
    ],
    questionMeta: [
      { id: 'd3_q1', affectsSubdimension: 'd3_focus', optionValues: [15, 35, 65, 85] },
      { id: 'd3_q2', affectsSubdimension: 'd3_decisions', optionValues: [15, 35, 60, 85] },
    ],
  },
  d4: {
    name: 'Equilibrio Emocional',
    subdimensions: [
      { key: 'd4_reactivity', name: 'Reactividad' },
      { key: 'd4_recovery', name: 'Tiempo de recuperación' },
      { key: 'd4_range', name: 'Rango emocional' },
    ],
    questionMeta: [
      { id: 'd4_q1', affectsSubdimension: 'd4_reactivity', optionValues: [15, 35, 65, 85] },
      { id: 'd4_q2', affectsSubdimension: 'd4_range', optionValues: [10, 35, 60, 85] },
    ],
  },
  d5: {
    name: 'Alegría de Vivir',
    subdimensions: [
      { key: 'd5_pleasure', name: 'Capacidad de placer' },
      { key: 'd5_meaning', name: 'Sentido de propósito' },
      { key: 'd5_connection', name: 'Conexión con otros' },
    ],
    questionMeta: [
      { id: 'd5_q1', affectsSubdimension: 'd5_pleasure', optionValues: [10, 35, 55, 85] },
      { id: 'd5_q2', affectsSubdimension: 'd5_connection', optionValues: [10, 35, 60, 85] },
    ],
  },
}

// ─── FUNCIONES PÚBLICAS ──────────────────────────────────────────────────────

/** Obtiene la configuración de subdimensiones para una dimensión */
export function getSubdimensionConfig(
  dimensionKey: DimensionKey,
  overrides?: Record<string, string>,
): SubdimensionConfig {
  const s = STRUCTURE[dimensionKey]
  return buildConfig(dimensionKey, s.name, s.subdimensions, s.questionMeta, overrides)
}

/** Calcula scores de subdimensiones a partir de las respuestas */
export function computeSubdimensionScores(
  config: SubdimensionConfig,
  responses: Record<string, string>,
): Record<string, number> {
  const scores: Record<string, number> = {}

  // Inicializar subdimensiones
  for (const sub of config.subdimensions) {
    scores[sub.key] = 50 // default si no hay pregunta directa
  }

  // Calcular desde las respuestas
  for (const q of config.questions) {
    const answer = responses[q.id]
    if (!answer) continue

    const option = q.options.find((o) => o.key === answer)
    if (!option) continue

    scores[q.affectsSubdimension] = option.value
  }

  // La tercera subdimensión (sin pregunta directa) se infiere
  // como promedio de las otras dos
  const answeredKeys = config.questions.map((q) => q.affectsSubdimension)
  const unansweredSubs = config.subdimensions.filter(
    (s) => !answeredKeys.includes(s.key),
  )
  if (unansweredSubs.length > 0) {
    const answeredScores = answeredKeys.map((k) => scores[k])
    const avg = Math.round(
      answeredScores.reduce((a, b) => a + b, 0) / answeredScores.length,
    )
    for (const sub of unansweredSubs) {
      scores[sub.key] = avg
    }
  }

  return scores
}
