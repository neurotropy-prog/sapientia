/**
 * reevaluation-insights.ts — Textos delta para reevaluación (Día 30/90)
 *
 * Genera insights personalizados basados en la comparación entre
 * scores originales y nuevos. Tres caminos:
 * - Score bajó → urgencia natural legítima
 * - Score subió → refuerzo positivo
 * - Score sin cambio → consolidación del patrón
 *
 * Per spec: FEATURE_GATEWAY_DESIGN.md líneas 1151-1153, 1221-1223
 */

import type { ReevaluationScores } from '@/lib/map-evolution'

export type DeltaDirection = 'decreased' | 'unchanged' | 'increased'

export interface ReevaluationInsight {
  direction: DeltaDirection
  headline: string
  body: string
  /** Tono del mensaje: urgencia, refuerzo, o consolidación */
  tone: 'urgency' | 'reinforcement' | 'consolidation'
}

/** Determina la dirección del cambio con un umbral de ±3 puntos */
function getDeltaDirection(oldScore: number, newScore: number): DeltaDirection {
  const diff = newScore - oldScore
  if (diff <= -3) return 'decreased'
  if (diff >= 3) return 'increased'
  return 'unchanged'
}

/** Genera el insight principal basado en el delta del score global */
export function getReevaluationInsight(
  oldScores: ReevaluationScores,
  newScores: ReevaluationScores,
  daysSinceCreation: number,
): ReevaluationInsight {
  const direction = getDeltaDirection(oldScores.global, newScores.global)
  const diff = newScores.global - oldScores.global
  const isQuarterly = daysSinceCreation >= 90

  const timeLabel = isQuarterly
    ? `${Math.floor(daysSinceCreation / 30)} meses`
    : 'un mes'

  switch (direction) {
    case 'decreased':
      return {
        direction,
        headline: 'Tu patrón se ha profundizado.',
        body: isQuarterly
          ? `En ${timeLabel}, tu score ha pasado de ${oldScores.global} a ${newScores.global} (${diff} puntos). Lo que hoy se resuelve en 12 semanas, dentro de un año puede requerir mucho más. Los datos de +5.000 personas confirman que cuanto más esperas, más profundo se instala el patrón.`
          : `En ${timeLabel}, tu score ha bajado de ${oldScores.global} a ${newScores.global} (${diff} puntos). No es un juicio — es un dato. Tu sistema nervioso te está diciendo algo con estos números. Cada semana sin regulación profundiza el patrón actual.`,
        tone: 'urgency',
      }

    case 'increased':
      return {
        direction,
        headline: 'Algo estás haciendo bien.',
        body: isQuarterly
          ? `En ${timeLabel}, tu score ha subido de ${oldScores.global} a ${newScores.global} (+${diff} puntos). Esta mejora es real — tus datos lo confirman. Imagina lo que conseguirías con un protocolo diseñado para tu patrón específico, con acompañamiento profesional.`
          : `En ${timeLabel}, tu score ha subido de ${oldScores.global} a ${newScores.global} (+${diff} puntos). Algo estás haciendo bien. Imagina con acompañamiento. El programa convertiría esa mejora en transformación permanente.`,
        tone: 'reinforcement',
      }

    case 'unchanged':
      return {
        direction,
        headline: 'Tu patrón se ha instalado.',
        body: isQuarterly
          ? `${timeLabel} y tu score sigue en ${newScores.global}/100. Un patrón que no cambia en ${timeLabel} no va a cambiar solo — está consolidado. Los datos dicen que cuanto más esperas, más profundo. Pero también dicen que cuanto antes empiezas, más rápida es la recuperación.`
          : `Tu score sigue en ${newScores.global}/100 — sin cambio en ${timeLabel}. Los datos de +5.000 personas dicen que un patrón que no cambia en un mes se está consolidando. Cuanto antes, más rápida la recuperación.`,
        tone: 'consolidation',
      }
  }
}

/** Genera insights por dimensión individual (para la vista comparativa) */
export function getDimensionDelta(
  dimensionName: string,
  oldScore: number,
  newScore: number,
): { label: string; color: string } {
  const diff = newScore - oldScore
  const direction = getDeltaDirection(oldScore, newScore)

  switch (direction) {
    case 'decreased':
      return {
        label: `${diff} puntos`,
        color: 'var(--color-error)',
      }
    case 'increased':
      return {
        label: `+${diff} puntos`,
        color: 'var(--color-success)',
      }
    case 'unchanged':
      return {
        label: 'Sin cambio',
        color: 'var(--color-text-tertiary)',
      }
  }
}
