/**
 * amplify-insights.ts — Lógica del insight comparativo AMPLIFY
 *
 * Genera insights dinámicos comparando dos mapas LARS.
 * Las 6 reglas de prioridad y la personalización por perfil
 * están definidas en FEATURE_AMPLIFY_DESIGN.md.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DimensionScores {
  global: number
  d1: number
  d2: number
  d3: number
  d4: number
  d5: number
}

export interface Brecha {
  dimension: string
  label: string
  diff: number
}

export interface ComparisonInsight {
  text: string
  brecha_mayor: Brecha
}

// ─── Dimension labels ────────────────────────────────────────────────────────

const DIMENSION_LABELS: Record<string, string> = {
  d1: 'Regulación Nerviosa',
  d2: 'Calidad de Sueño',
  d3: 'Claridad Cognitiva',
  d4: 'Equilibrio Emocional',
  d5: 'Alegría de Vivir',
}

// ─── Profile codes for matching ──────────────────────────────────────────────

const PROFILE_CODES: Record<string, string> = {
  'Productivo Colapsado': 'PC',
  'Fuerte Invisible': 'FI',
  'Cuidador Exhausto': 'CE',
  'Controlador Paralizado': 'CP',
}

// ─── Calculate brechas ───────────────────────────────────────────────────────

export function calcularBrechas(a: DimensionScores, b: DimensionScores): Brecha[] {
  const dims = ['d1', 'd2', 'd3', 'd4', 'd5'] as const
  return dims
    .map((key) => ({
      dimension: key,
      label: DIMENSION_LABELS[key],
      diff: Math.abs(a[key] - b[key]),
    }))
    .sort((x, y) => y.diff - x.diff)
}

// ─── Base insight texts (before profile personalization) ─────────────────────

const BASE_INSIGHTS = {
  mismo_perfil: (profile: string) =>
    `Ambos sois ${profile}. Eso significa que os entendéis — pero también que os retroalimentáis sin daros cuenta. Cuando dos personas con el mismo patrón comparten entorno, las señales de alerta se normalizan. Lo que para otros sería una alarma, para vosotros es "lo normal."`,

  ambos_d1_comprometido: () =>
    'Vuestros sistemas nerviosos están comprometidos y se retroalimentan. Cuando dos personas cercanas tienen el sistema nervioso desregulado, el estrés de uno amplifica el del otro. Regularse juntos es exponencialmente más efectivo que hacerlo por separado.',

  ambos_d5_bajo: () =>
    'Ninguno de los dos recuerda cuándo disfrutó algo de verdad. Eso no es coincidencia — la anhedonia en personas cercanas es contagiosa. Cuando uno recupera la capacidad de disfrutar, el otro lo nota.',

  scores_similares: () =>
    'Vuestros mapas son casi idénticos. Eso confirma que compartís el mismo entorno de estrés — y que la solución también es compartida. No es casualidad: los patrones de desgaste se sincronizan en personas que conviven o trabajan juntas.',

  gran_brecha: (dim: string) =>
    `La dimensión donde más os diferenciáis es ${dim}. Esto suele significar que uno compensa lo que al otro le falta: un patrón frecuente en parejas y socios. La compensación funciona a corto plazo, pero agota al que compensa.`,

  default: (brecha: Brecha) =>
    `Vuestra mayor diferencia está en ${brecha.label} (${brecha.diff} puntos). Esto revela cómo cada uno gestiona el desgaste de forma distinta, aunque compartáis el mismo entorno.`,
}

// ─── Profile-personalized variants ───────────────────────────────────────────

function personalizeForProfile(baseInsight: string, profileCode: string, brecha: Brecha): string {
  switch (profileCode) {
    case 'PC':
      return `${baseInsight}\n\nLa brecha en ${brecha.label} entre ambos es de ${brecha.diff} puntos. Si uno de los dos recupera esta dimensión, el otro gana eficiencia indirecta — es el efecto multiplicador que los datos muestran en parejas y equipos.`

    case 'FI':
      return `${baseInsight}\n\nBrecha mayor: ${brecha.dimension.toUpperCase()} ${brecha.label} (${brecha.diff} pts). Estadísticamente, parejas con brecha >${Math.max(20, brecha.diff)} en ${brecha.dimension.toUpperCase()} muestran convergencia en 8 semanas si ambos participan.`

    case 'CE':
      return `${baseInsight}\n\nLos dos tenéis patrones que se refuerzan mutuamente. El 91% de parejas con mapas similares mejoran cuando trabajan juntos. No estáis solos en esto.`

    case 'CP':
      return `${baseInsight}\n\nPlan de comparación: Semana 2 — revisar brecha en ${brecha.label}. Semana 4 — checkpoint de progreso. Semana 8 — evaluar convergencia. Cada paso tiene métricas claras.`

    default:
      return baseInsight
  }
}

// ─── Main function ───────────────────────────────────────────────────────────

/**
 * Genera el insight comparativo entre dos mapas LARS.
 *
 * @param scoresA - Scores del invitador
 * @param scoresB - Scores del invitado
 * @param profileA - Perfil del invitador (ej: "Productivo Colapsado")
 * @param profileB - Perfil del invitado
 * @returns Insight text + brecha mayor
 */
export function generateComparisonInsight(
  scoresA: DimensionScores,
  scoresB: DimensionScores,
  profileA: string,
  profileB: string,
): ComparisonInsight {
  const brechas = calcularBrechas(scoresA, scoresB)
  const mayorBrecha = brechas[0]
  const profileCode = PROFILE_CODES[profileA] ?? ''

  let baseText: string

  // Prioridad 1: Mismo perfil
  if (profileA === profileB) {
    baseText = BASE_INSIGHTS.mismo_perfil(profileA)
  }
  // Prioridad 2: Ambos D1 < 40
  else if (scoresA.d1 < 40 && scoresB.d1 < 40) {
    baseText = BASE_INSIGHTS.ambos_d1_comprometido()
  }
  // Prioridad 3: Ambos D5 < 35
  else if (scoresA.d5 < 35 && scoresB.d5 < 35) {
    baseText = BASE_INSIGHTS.ambos_d5_bajo()
  }
  // Prioridad 4: Scores globales similares (±5)
  else if (Math.abs(scoresA.global - scoresB.global) <= 5) {
    baseText = BASE_INSIGHTS.scores_similares()
  }
  // Prioridad 5: Brecha > 25 en una dimensión
  else if (mayorBrecha.diff > 25) {
    baseText = BASE_INSIGHTS.gran_brecha(mayorBrecha.label)
  }
  // Prioridad 6: Default
  else {
    baseText = BASE_INSIGHTS.default(mayorBrecha)
  }

  // Personalizar según perfil del invitador
  const text = profileCode
    ? personalizeForProfile(baseText, profileCode, mayorBrecha)
    : baseText

  return { text, brecha_mayor: mayorBrecha }
}
