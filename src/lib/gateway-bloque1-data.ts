/**
 * gateway-bloque1-data.ts
 * Fuente de verdad de todo el copy del Bloque 1 del gateway.
 * P2 → Primera Verdad → P3 → P4 → Micro-espejo 1
 * Texto exacto de docs/features/FEATURE_GATEWAY_DESIGN.md — no inventado.
 *
 * Copy override support: functions accept optional overrides map.
 * Static exports remain for backward compatibility.
 */


// ─── TIPOS ───────────────────────────────────────────────────────────────────

export type P1Option = 'A' | 'B' | 'C' | 'D' | 'E'
export type P2Option = 'A' | 'B' | 'C' | 'D' | 'E'
export type P4Option = 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

export interface ReflectionContent {
  text: string
  collectiveData: string
}

export interface SelectOption {
  id: string
  title: string
  subtitle?: string
}

// ─── P2 — OPCIONES ────────────────────────────────────────────────────────────

export const P2_OPTIONS: SelectOption[] = [
  {
    id: 'A',
    title: '"Me cuesta dormirme. Mi mente no se apaga"',
  },
  {
    id: 'B',
    title: '"Me despierto a las 3-4 de la mañana y no puedo volver a dormirme"',
  },
  {
    id: 'C',
    title: '"Duermo horas pero me despierto igual de cansado"',
  },
  {
    id: 'D',
    title: '"Duermo poco pero funciono"',
  },
  {
    id: 'E',
    title: '"Mi sueño es razonablemente bueno"',
  },
]

// ─── P3 — OPCIONES (selección múltiple) ──────────────────────────────────────

export interface MultiOption {
  id: string
  title: string
  subtitle?: string
}

export const P3_OPTIONS: MultiOption[] = [
  {
    id: 'niebla',
    title: 'Saturación mental',
    subtitle: 'Leo algo y al terminar no sé ni qué he leído.',
  },
  {
    id: 'decisiones',
    title: 'Me cuesta concentrarme y tomar buenas decisiones',
    subtitle: 'He perdido capacidad y claridad mental. Decisiones simples se vuelven agotadoras.',
  },
  {
    id: 'dispersa',
    title: 'Falta de foco',
    subtitle: 'Mi cabeza salta de un tema a otro sin control.',
  },
  {
    id: 'palabras',
    title: 'No me viene la palabra',
    subtitle: 'Últimamente me cuesta recordar la palabra que busco.',
  },
  {
    id: 'decisional',
    title: '"Agotamiento decisional"',
    subtitle: 'Al final del día no puedo elegir ni qué cenar.',
  },
  {
    id: 'ninguna',
    title: '"Ninguna de estas"',
    subtitle: '',
  },
]

// ─── P4 — OPCIONES ────────────────────────────────────────────────────────────

export const P4_OPTIONS: SelectOption[] = [
  {
    id: 'A',
    title: '"Irritabilidad"',
    subtitle: 'Reaccionas a menudo con enfado con impaciencia.',
  },
  {
    id: 'B',
    title: 'No logro disfrutar con nada.',
    subtitle: 'Lo que te hacía feliz ya no te satisface.',
  },
  {
    id: 'C',
    title: 'Reaccionas por detalles insignificantes',
    subtitle: 'Explotas con quien más quieres y después te sientes fatal.',
  },
  {
    id: 'D',
    title: 'Vivo desconectado de mí y de los demás',
    subtitle: 'Tiendes a aislarte y no te apetece relacionarte.',
  },
  {
    id: 'E',
    title: 'Obsesividad mental',
    subtitle: 'Mi mente me pide estimulación constante y no puedo pararla.',
  },
  {
    id: 'F',
    title: '"Razonablemente bien"',
    subtitle: 'Tu equilibrio emocional es aceptable.',
  },
]

// ─── PRIMERA VERDAD — 25 variantes P1 × P2 (todas las combinaciones) ──────────

// Clave: "P1P2" (sin dash). Todos los 25 pares cubiertos.
const PRIMERA_VERDAD_MAP: Record<string, ReflectionContent> = {
  // P1=A (Malestar)
  'AA': {
    text: 'Tu mente no se apaga ya que el estrés crónico promociona hormonas como la adrenalina, la noradrenalina y el cortisol que promueven la activación de modo huída. Esta respuesta recluta recursos energéticos que no se gastan físicamente (ciclo del estrés incompleto). Tu cuerpo usa esa energía en procesos obsesivos compulsivos negativos que retroalimentan el modo simpático.',
    collectiveData:
      'El 78% de los +25.000 sistemas nerviosos analizados no está ajustado ni a los ciclos ni a los biorritmos que tu cuerpo necesita para funcionar de forma equilibrada.',
  },
  'AB': {
    text: 'A nivel bioquímico este patrón suele conectarse con la hipoglucemia nocturna. Tu cuerpo no tiene la energía suficiente para completar los ciclos de sueño y segrega hormonas que promocionan energía rápida pero activan tu sistema nervioso. Normalmente es un síntoma fácil y rápido de regular.',
    collectiveData:
      'El 82% de las personas que hemos neuroregulado responden en menos de 72 h a protocolos de suplementación con aminoácidos que estabilizan el metabolismo energético incrementando drásticamente la calidad y cantidad de su descanso.',
  },
  'AC': {
    text: 'Tu sistema nervioso está activado incluso durante el descanso. El sueño no reparador es un patrón en el que tu cuerpo no alcanza las fases profundas de recuperación que necesita para restaurarse. Es un síntoma que requiere atención específica.',
    collectiveData:
      'El 76% de personas con tu patrón presentan déficit en la arquitectura del sueño. Pueden dormir 8 horas pero experimentar solo 2-3 horas de sueño profundo.',
  },
  'AD': {
    text: 'Tu cuerpo ha adaptado su señalización al déficit de sueño, pero eso no significa que esté funcionando bien. Es como conducir con la gasolina en rojo: puedes llegar al próximo kilómetro pero no es un viaje seguro.',
    collectiveData:
      'El 64% de personas que "funcionan" con poco sueño muestran deterioro progresivo en funciones ejecutivas en los siguientes 12-18 meses.',
  },
  'AE': {
    text: 'Tu sueño está funcionando pero aún así sientes malestar. Esto indica que el agotamiento tiene otras raíces más allá del descanso nocturno — la calidad de tu recuperación durante el día también importa.',
    collectiveData:
      'El 58% de personas con buen sueño pero malestar persistente presentan desregulación del sistema nervioso autónomo durante el día. El estrés crónico de vigilia es el culpable.',
  },

  // P1=B (Consecuencias)
  'BA': {
    text: 'Tu rendimiento bajó porque has estado expuesto a niveles de estrés muy altos que han comprometido tu descanso. La falta de sueño te ha llevado a un estado de mayor irritabilidad, reactividad y negatividad.',
    collectiveData:
      'El 71% de ejecutivos con deterioro cognitivo progresivo reportan un patrón de sueño idéntico al tuyo como factor previo. La conexión es directa y reversible.',
  },
  'BB': {
    text: 'Los despertares nocturnos crónicos comprometen directamente tus capacidades cognitivas y tu regulación emocional. Las consecuencias que ves en tu rendimiento y relaciones son la extensión natural de esta fragmentación del descanso.',
    collectiveData:
      'El 73% de personas con consecuencias laborales o relacionales reportan despertares nocturnos recurrentes. Reparar el patrón de sueño suele invertir las consecuencias en 4-6 semanas.',
  },
  'BC': {
    text: 'Tu cuerpo intenta dormir pero no logra recuperarse. Las consecuencias que ves — el deterioro cognitivo, los conflictos personales, la caída de rendimiento — son síntomas de un sistema que no se está regenerando de verdad.',
    collectiveData:
      'El 82% de las personas con consecuencias serias y sueño no reparador tienen una posible deficiencia metabólica o nutricional que bloquea la recuperación profunda. Es identificable y corregible.',
  },
  'BD': {
    text: 'Crees que funcionas porque el estrés crónico ha entumecido tu percepción de cansancio. Pero tu sistema está enviando mensajes a través de las consecuencias que ves: conflictos, errores, desconexión.',
    collectiveData:
      'El 67% de ejecutivos que reportan consecuencias serias + bajo sueño + sensación de que "siguen funcionando" muestran aceleración del envejecimiento cognitivo de 15-20 años.',
  },
  'BE': {
    text: 'Tu sueño es bueno pero las consecuencias persisten. Esto indica que el estrés también opera en tu sistema nervioso durante el día. El descanso nocturno no es suficiente si vives en modo emergencia.',
    collectiveData:
      'El 61% de personas con buen sueño pero consecuencias laborales/relacionales necesitan regulación del sistema nervioso de vigilia, no solo sueño. La hipnosis y el mindfulness son insuficientes sin cambio de contexto.',
  },

  // P1=C (Atrapado)
  'CA': {
    text: 'Tu mente que no se apaga es el sistema que creaste para lidiar con la sensación de estar atrapado. La vigilancia mental es el precio que pagas por mantener ilusión de control. Tu cuerpo ya no puede sostenerla.',
    collectiveData:
      'El 68% de personas que sienten atrapadas + hiperactividad mental reportan una sensación de liberación después de tomar decisiones intencionales sobre su contexto — incluso pequeñas.',
  },
  'CB': {
    text: 'Este síntoma puede estar relacionado con un posible déficit metabólico o con posibles deficiencias en los neurotransmisores y hormonas que regulan los ciclos de sueño y vigilia.',
    collectiveData:
      'El 82% de las personas con señales físicas persistentes y sueño no reparador muestran activación crónica del sistema de alerta. Vivir en modo huida compromete seriamente tu salud física y emocional. Tus relaciones y tus logros se ponen en riesgo.',
  },
  'CC': {
    text: 'Tu cuerpo te está dando señales que tu mente intenta ignorar. El cansancio que no se va con sueño es la más clara — y la que más información contiene.',
    collectiveData:
      'El 82% de las personas con señales físicas persistentes y sueño no reparador muestran activación crónica del sistema de alerta. Vivir en modo huida compromete seriamente tu salud física y emocional. Tus relaciones y tus logros se ponen en riesgo.',
  },
  'CD': {
    text: 'Tu aparente funcionamiento con poco sueño mientras te sientes atrapado es un síntoma de disociación. Tu cuerpo está en modo supervivencia, anestesiado contra el malestar emocional de la trampa.',
    collectiveData:
      'El 72% de personas que sienten atrapadas + bajo sueño + sensación de funcionamiento presentan disociación emocional. La sensación de "estar OK" es una defensa, no una realidad.',
  },
  'CE': {
    text: 'Tu sueño está funcionando pero aún sientes que tu vida no es la tuya. Esto revela que la trampa no es del cuerpo sino del contexto — y eso es lo más importante para entender porque es lo que puedes cambiar.',
    collectiveData:
      'El 54% de personas con buen sueño pero sensación de trampa experimentan un cambio profundo en su bienestar después de tomar decisiones intencionales sobre su contexto laboral o relacional.',
  },

  // P1=D (Agotamiento crónico) — ahora 5 opciones específicas
  'DA': {
    text: 'La gente que tienes cerca puede ver claramente las consecuencias para ti y para los demás del comportamiento que tú llevas tiempo normalizando. Tu sistema nervioso te empieza a dar señales de alarma.',
    collectiveData:
      'El 69% de personas derivadas por un profesional presentan un nivel de agotamiento que ya habían normalizado completamente.',
  },
  'DB': {
    text: 'La gente que tienes cerca puede ver claramente las consecuencias para ti y para los demás del comportamiento que tú llevas tiempo normalizando. Tu sistema nervioso te empieza a dar señales de alarma.',
    collectiveData:
      'El 69% de personas derivadas por un profesional presentan un nivel de agotamiento que ya habían normalizado completamente.',
  },
  'DC': {
    text: 'La gente que tienes cerca puede ver claramente las consecuencias para ti y para los demás del comportamiento que tú llevas tiempo normalizando. Tu sistema nervioso te empieza a dar señales de alarma.',
    collectiveData:
      'El 69% de personas derivadas por un profesional presentan un nivel de agotamiento que ya habían normalizado completamente.',
  },
  'DD': {
    text: 'La gente que tienes cerca puede ver claramente las consecuencias para ti y para los demás del comportamiento que tú llevas tiempo normalizando. Tu sistema nervioso te empieza a dar señales de alarma.',
    collectiveData:
      'El 69% de personas derivadas por un profesional presentan un nivel de agotamiento que ya habían normalizado completamente.',
  },
  'DE': {
    text: 'La gente que tienes cerca puede ver claramente las consecuencias para ti y para los demás del comportamiento que tú llevas tiempo normalizando. Tu sistema nervioso te empieza a dar señales de alarma.',
    collectiveData:
      'El 69% de personas derivadas por un profesional presentan un nivel de agotamiento que ya habían normalizado completamente.',
  },

  // P1=E (Alerta máxima)
  'EA': {
    text: 'Tu mente en alerta máxima que no se apaga es el mismo sistema. La hipervigilancia que intentas usar como defensa se ha convertido en tu prisión. Tu cuerpo gasta toda su energía en monitoreo, no en vivir.',
    collectiveData:
      'El 77% de personas en alerta máxima + hiperactividad mental muestran reversión significativa de síntomas en 8-12 semanas de neuroregulación. Tu percepción de amenaza es entrenable.',
  },
  'EB': {
    text: 'Tus despertares nocturnos son el sistema de alarma en funcionamiento. Tu cuerpo anticipa amenaza incluso mientras intentas dormir. La defensa se ha activado 24/7.',
    collectiveData:
      'El 81% de personas con hipervigilancia + despertares nocturnos mejoran dramáticamente con protocolos que bajan la respuesta de amenaza del cuerpo — no solo del sueño.',
  },
  'EC': {
    text: 'Tu cuerpo está en defensa incluso mientras duermes. El sueño no reparador es una consecuencia de estar constantemente en modo amenaza. Tu sistema nervioso no se relaja lo suficiente para recuperarse.',
    collectiveData:
      'El 79% de personas con hipervigilancia crónica + sueño no reparador experimentan sueño profundo restaurativo después de regulación del sistema nervioso autónomo.',
  },
  'ED': {
    text: 'Dices que funcionas con poco sueño. Las ciencia es clara y contundente: este comportamiento implica grandes riesgos para la salud como la neurodegeneración y el riesgo cardiovascular.',
    collectiveData:
      'El 74% de personas que declaran "funcionar con poco sueño" muestran marcadores de déficit cognitivo acumulado que no perciben. El umbral se mueve — lo que antes era cansancio ya no lo registras como tal.',
  },
  'EE': {
    text: 'Tu sueño es bueno pero tu mente sigue en alerta máxima. Esto es importante: el descanso físico es suficiente, pero tu percepción de amenaza sigue activa. La solución no es más sueño sino menos miedo.',
    collectiveData:
      'El 56% de personas con buen sueño pero alerta máxima crónica encuentran liberación a través de protocolos que entrenan la percepción de seguridad — neuroplasticidad enfocada en desactivar falsos positivos de amenaza.',
  },
}

// Fallback por defecto
const PRIMERA_VERDAD_DEFAULT: ReflectionContent = {
  text: 'Tu sistema nervioso lleva tiempo funcionando en modo de emergencia. Lo que sientes no es debilidad — es el resultado predecible de un sistema que no ha descansado de verdad.',
  collectiveData:
    'El 78% de los +25.000 sistemas nerviosos que hemos analizados con tu patrón de respuestas presentan niveles elevados de cortisol y adrenalina, provocando estrés crónico e inflamación sistémica.',
}

type CopyGetter = (key: string) => string

export function getPrimeraVerdad(p1: string, p2: string, getCopy?: CopyGetter): ReflectionContent {
  // Construir clave de combinación: P1P2 (sin dash)
  const key = `${p1}${p2}`
  const base = PRIMERA_VERDAD_MAP[key] || PRIMERA_VERDAD_DEFAULT

  if (!getCopy) return base

  // Resolver copy con getCopy, fallback a base si la key no devuelve valor
  const textKey = `gateway.primeraverdad.${key}.text`
  const collectiveKey = `gateway.primeraverdad.${key}.collective`
  const textVal = getCopy(textKey)
  const collectiveVal = getCopy(collectiveKey)

  return {
    text: textVal !== textKey ? textVal : base.text,
    collectiveData: collectiveVal !== collectiveKey ? collectiveVal : base.collectiveData,
  }
}

// ─── MICRO-ESPEJO 1 — 5 variantes P3 × P4 ────────────────────────────────────

// Hardcoded micro-espejo 1 variants
const MICRO_ESPEJO_1: Record<string, ReflectionContent> = {
  pocoB: {
    text: 'Tu cerebro funciona pero por dentro hay un vacío. No es tristeza — es un sistema nervioso que se ha apagado para protegerte. Como un fusible que salta.',
    collectiveData: 'El 68% de personas con tu combinación no identifican esto como agotamiento. Lo viven como ausencia sin causa. Tiene causa — y tiene solución.',
  },
  muchoC: {
    text: 'Das todo lo que tienes a los demás y lo que queda para ti no es suficiente. Tu cerebro no tiene recursos para regularse  y el resultado es que explotas con quien más aprecias.',
    collectiveData: 'El 79% de personas con tu patrón sienten culpa después de las explosiones. Esa culpa también agota. Es un ciclo — no un defecto de carácter.',
  },
  muchoD: {
    text: 'Tu cuerpo ha encontrado la forma más radical de protegerte: apagar los circuitos. No es que no te importe — es que sentir se volvió demasiado costoso para tu sistema.',
    collectiveData: 'El 74% de personas con anestesia emocional tardan más de 2 años en identificar lo que les ocurre. Tú lo estás nombrando hoy.',
  },
  pocoE: {
    text: 'Tu capacidad cognitiva está intacta pero tu mente la usa para anticipar en lugar de ejecutar. No estás pensando — estás sobreviviendo mentalmente.',
    collectiveData: 'El 73% de personas con obsesividad mental activa tienen el sistema nervioso en hipervigilancia constante. La amenaza que tratas de predecir agotan tus recursos energéticos y comprometen tu bienestar emocional, tu claridad mental, la creatividad y la agilidad para hacer frente tanto a los imprevistos .',
  },
  default: {
    text: 'Tu cabeza va a mil pero tu capacidad de procesar la información se ha reducido de forma dramática. No logras ni desconectar ni descansar y te sientes frustrado, asustado y desorientado con esta situación.',
    collectiveData: 'El 65% de personas con tu combinación de respuestas no saben que la irritabilidad y la saturación cognitiva tienen la misma causa. Cuando se regula una, la otra mejora.',
  },
}

export function getMicroEspejo1(
  p3Selections: string[],
  p4: string,
  getCopy?: CopyGetter,
): ReflectionContent {
  const realSymptoms = p3Selections.filter((s) => s !== 'ninguna')
  const many = realSymptoms.length >= 3

  let variantKey: string
  if (!many && p4 === 'B') variantKey = 'pocoB'
  else if (many && p4 === 'C') variantKey = 'muchoC'
  else if (many && p4 === 'D') variantKey = 'muchoD'
  else if (!many && p4 === 'E') variantKey = 'pocoE'
  else variantKey = 'default'

  const base = MICRO_ESPEJO_1[variantKey]

  if (!getCopy) return base

  const textKey = `gateway.microespejo1.${variantKey}.text`
  const collectiveKey = `gateway.microespejo1.${variantKey}.collective`
  const textVal = getCopy(textKey)
  const collectiveVal = getCopy(collectiveKey)

  return {
    text: textVal !== textKey ? textVal : base.text,
    collectiveData: collectiveVal !== collectiveKey ? collectiveVal : base.collectiveData,
  }
}

// ─── OVERRIDE HELPERS ────────────────────────────────────────────────────────

/** Returns P1 options with copy overrides applied. */
export function getP1Options(getCopy: CopyGetter): SelectOption[] {
  const ids = ['A', 'B', 'C', 'D', 'E'] as const
  return ids.map((id) => ({
    id,
    title: getCopy(`gateway.p1.option${id}.title`),
    subtitle: getCopy(`gateway.p1.option${id}.subtitle`),
  }))
}

/** Returns P2 options with copy overrides applied. */
export function getP2Options(getCopy: CopyGetter): SelectOption[] {
  return P2_OPTIONS.map((opt) => ({
    ...opt,
    title: getCopy(`gateway.p2.option${opt.id}`),
  }))
}

/** Returns P3 options with copy overrides applied. */
export function getP3Options(getCopy: CopyGetter): MultiOption[] {
  return P3_OPTIONS.map((opt) => ({
    ...opt,
    title: getCopy(`gateway.p3.${opt.id}.title`),
    subtitle: getCopy(`gateway.p3.${opt.id}.subtitle`),
  }))
}

/** Returns P4 options with copy overrides applied. */
export function getP4Options(getCopy: CopyGetter): SelectOption[] {
  return P4_OPTIONS.map((opt) => ({
    ...opt,
    title: getCopy(`gateway.p4.option${opt.id}.title`),
    subtitle: getCopy(`gateway.p4.option${opt.id}.subtitle`),
  }))
}
