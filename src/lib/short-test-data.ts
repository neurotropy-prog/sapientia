/**
 * short-test-data.ts
 * Test corto de 4 preguntas + 1 abierta para reactivación de leads
 * que ya hicieron el test de neurotransmisores.
 *
 * Output = un BUCKET de problema actual:
 *   ansiedad | insomnio | fatiga | estres_cronico
 *
 * El bucket determina la secuencia de email que recibe el lead.
 *
 * Severidad por opción: A=0, B=1, C=2, D=3, E=4 (donde 4 = más grave).
 * P2 (sueño) tiene mapeo especial — copy literal de LARS gateway-bloque1-data.ts.
 */

export type Bucket = 'ansiedad' | 'insomnio' | 'fatiga' | 'estres_cronico'

export interface ShortOption {
  id: 'A' | 'B' | 'C' | 'D' | 'E'
  title: string
  subtitle?: string
}

// ─── P1 — ANSIEDAD ───────────────────────────────────────────────────────────

export const P1_QUESTION = '¿Cómo describirías tu nivel de ansiedad en las últimas semanas?'

export const P1_OPTIONS: ShortOption[] = [
  { id: 'A', title: 'Casi inexistente. Me siento tranquilo la mayor parte del tiempo.' },
  { id: 'B', title: 'Puntual. Momentos de inquietud que pasan rápido.' },
  { id: 'C', title: 'Persistente. La sensación de alerta no se va del todo.' },
  { id: 'D', title: 'Intensa. Me cuesta funcionar bien por culpa de ella.' },
  { id: 'E', title: 'Desbordante. Paraliza decisiones y rutinas.' },
]

// ─── P2 — SUEÑO (COPIA LITERAL DE LARS gateway-bloque1-data.ts:28-50) ────────

export const P2_QUESTION = '¿Cuál de estas describe mejor tu sueño?'

export const P2_OPTIONS: ShortOption[] = [
  { id: 'A', title: '"Me cuesta dormirme. Mi mente no se apaga"' },
  { id: 'B', title: '"Me despierto a las 3-4 de la mañana y no puedo volver a dormirme"' },
  { id: 'C', title: '"Duermo horas pero me despierto igual de cansado"' },
  { id: 'D', title: '"Duermo poco pero funciono"' },
  { id: 'E', title: '"Mi sueño es razonablemente bueno"' },
]

// ─── P3 — FATIGA / ENERGÍA ───────────────────────────────────────────────────

export const P3_QUESTION = '¿Cómo está tu energía durante el día?'

export const P3_OPTIONS: ShortOption[] = [
  { id: 'A', title: 'Buena. Tengo energía la mayor parte del día.' },
  { id: 'B', title: 'Con bajones puntuales que recupero con descanso.' },
  { id: 'C', title: 'Cansancio constante de fondo aunque duerma.' },
  { id: 'D', title: 'Agotamiento físico y mental que no se va.' },
  { id: 'E', title: 'Vivo en reserva. Sin energía para casi nada.' },
]

// ─── P4 — ESTRÉS CRÓNICO ─────────────────────────────────────────────────────

export const P4_QUESTION = '¿Sientes que llevas mucho tiempo sin poder bajar el ritmo?'

export const P4_OPTIONS: ShortOption[] = [
  { id: 'A', title: 'No. Me regulo bien.' },
  { id: 'B', title: 'Períodos puntuales de mucha exigencia, luego me recupero.' },
  { id: 'C', title: 'Llevo meses sin poder parar de verdad.' },
  { id: 'D', title: 'Vivo acelerado todo el día. No consigo desconectar.' },
  { id: 'E', title: 'Crónico. Mi cuerpo ya no sabe estar en calma.' },
]

// ─── P5 — CAMPO ABIERTO (OPCIONAL) ───────────────────────────────────────────

export const P5_QUESTION = '¿Hay otro problema actual que quieras contarnos?'
export const P5_PLACEHOLDER = 'Opcional. Máximo 200 caracteres.'
export const P5_MAX_LENGTH = 200

// ─── SCORING + BUCKET ────────────────────────────────────────────────────────

const SEVERITY: Record<ShortOption['id'], number> = { A: 0, B: 1, C: 2, D: 3, E: 4 }

/** P2 (sueño) tiene mapeo no lineal — A y B son insomnio puro, C tira a fatiga,
 *  D a estrés (negación), E es OK. */
const P2_SEVERITY: Record<ShortOption['id'], number> = { A: 4, B: 4, C: 3, D: 2, E: 0 }

export interface ShortTestAnswers {
  p1: ShortOption['id']  // ansiedad
  p2: ShortOption['id']  // sueño → insomnio
  p3: ShortOption['id']  // fatiga
  p4: ShortOption['id']  // estrés crónico
  p5?: string            // campo libre opcional
}

export interface BucketResult {
  bucket: Bucket
  scores: { ansiedad: number; insomnio: number; fatiga: number; estres_cronico: number }
  /** Si dos o más ejes empatan en severidad, los listamos como secundarios. */
  secondary: Bucket[]
}

/** Determina el bucket primario y secundarios.
 *  Tie-break en orden comercial: ansiedad > insomnio > fatiga > estres_cronico.
 *  Razonamiento: ansiedad/insomnio convierten mejor a LIBERA (66% del universo
 *  de leads). Fatiga y estrés tienen menor encaje inmediato con productos activos.
 */
export function classify(answers: ShortTestAnswers): BucketResult {
  const scores = {
    ansiedad: SEVERITY[answers.p1],
    insomnio: P2_SEVERITY[answers.p2],
    fatiga: SEVERITY[answers.p3],
    estres_cronico: SEVERITY[answers.p4],
  }

  const order: Bucket[] = ['ansiedad', 'insomnio', 'fatiga', 'estres_cronico']
  const max = Math.max(...order.map(b => scores[b]))
  const tied = order.filter(b => scores[b] === max)
  const bucket = tied[0]
  const secondary = tied.slice(1)

  return { bucket, scores, secondary }
}

/** Copy del resultado para la pantalla final. */
export const BUCKET_COPY: Record<Bucket, { headline: string; body: string }> = {
  ansiedad: {
    headline: 'Tu prioridad ahora mismo es la ansiedad.',
    body: 'En las próximas horas te llega un correo con el primer paso para regular tu sistema nervioso desde dentro.',
  },
  insomnio: {
    headline: 'Tu prioridad ahora mismo es el sueño.',
    body: 'Te enviamos un correo con un protocolo concreto para reparar tu descanso, basado en lo que estás describiendo.',
  },
  fatiga: {
    headline: 'Tu prioridad ahora mismo es la fatiga.',
    body: 'Recuperar tu energía no es solo descansar más. Te llega un correo con la primera intervención.',
  },
  estres_cronico: {
    headline: 'Tu prioridad ahora mismo es el estrés crónico.',
    body: 'Llevas tiempo sin poder bajar el ritmo. Te enviamos el primer paso del protocolo de neurorregulación.',
  },
}
