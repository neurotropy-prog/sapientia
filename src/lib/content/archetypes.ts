/**
 * archetypes.ts — Los 7 mecanismos de defensa adaptativos
 *
 * Contenido real de:
 * - /arquetipos/cards.pdf (6 patrones de burnout por arquetipo)
 * - /arquetipos/tres_capas_necesidad.pdf (3 capas de necesidad)
 * - /arquetipos/arquetipos-conexiones.jpeg (matriz de intensidades)
 *
 * © Neurotropy · Instituto Epigenético
 */

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface BurnoutPattern {
  name: string
  description: string
}

export interface NeedLayer {
  title: string
  items: string[]
  explanation: string
}

export interface ArchetypeData {
  id: number
  key: string
  name: string
  descriptors: string
  /** Grupo caracterológico: Desconfiados, Humillados, Vulnerables, Necesitados, Rechazados */
  group: string
  wound: string
  armor: string
  snState: string
  /** Narrativa completa del mecanismo de defensa — texto espejo en 2ª persona */
  narrative: string
  /** Creencia central que gobierna el patrón (ej: "No puedo confiar en nadie") */
  centralBelief: string
  /** Creencia de sanación — la dirección de integración */
  healingBelief: string
  /** Miedos principales del mecanismo de defensa */
  fears: string[]
  /** Frase corta para el teaser en el mapa */
  teaser: string
  /** 6 patrones de burnout */
  patterns: BurnoutPattern[]
  /** 3 capas de necesidad (bioquímica → SN → emocional) */
  needs: {
    biochemical: NeedLayer
    nervousSystem: NeedLayer
    emotional: NeedLayer
  }
}

// ─── LOS 7 MECANISMOS DE DEFENSA ────────────────────────────────────────────

const ARCHETYPES: ArchetypeData[] = [
  {
    id: 1,
    key: 'esceptico',
    name: 'Escepticismo',
    descriptors: 'Desconfianza · Impenetrabilidad · Hermetismo',
    group: 'Desconfiados',
    wound: 'Traición',
    armor: 'Desconfianza + hipervigilancia',
    snState: 'Simpático crónico — eje HPA hiperactivo, cortisol elevado',
    narrative: 'En algún momento de tu historia alguien en quien confiaste plenamente te traicionó, y esa traición llegó desde el lugar donde menos la esperabas. Quizá fue un padre que prometía y no cumplía, una madre cuyo amor venía con condiciones invisibles, una pareja que usó tu vulnerabilidad como munición, o un entorno donde mostrarte tal como eras se pagaba con humillación o abandono.\n\nTu sistema nervioso extrajo una conclusión que ya no te consultó: confiar es el preludio del daño. Y a partir de ese momento cerró con llave desde dentro.\n\nNo es que no quieras abrirte, es que cada vez que alguien cruzó tus puertas, destrozó algo que tardaste años en construir. Eres hermético no por frialdad sino por supervivencia, impenetrable no por arrogancia sino porque la vulnerabilidad siempre vino acompañada de dolor.',
    centralBelief: 'No puedo confiar en nadie. Debo estar siempre en guardia.',
    healingBelief: 'Es posible confiar y no ser traicionado. Puedo sentirme seguro y confiado.',
    fears: [
      'Ser traicionado, manipulado y atacado',
      'Pérdida de control y vulnerabilidad ante otros',
      'Estar solo o sin apoyo real',
    ],
    teaser: 'Tu sistema nervioso escanea amenazas 24/7. No te quemas por trabajar demasiado sino por vigilar demasiado.',
    patterns: [
      {
        name: 'Hiperactivación',
        description: 'Su sistema nervioso escanea amenazas 24/7. No se quema por trabajar demasiado sino por vigilar demasiado. El simpático no se apaga nunca.',
      },
      {
        name: 'Perfeccionismo',
        description: 'Si todo es impecable, nadie puede usarlo en tu contra. El perfeccionismo aquí es control preventivo: anticipar la traición cerrando todas las grietas.',
      },
      {
        name: 'Negación del cuerpo',
        description: 'El cuerpo es territorio de vulnerabilidad. Sentir implica bajar la guardia, y bajar la guardia significa quedar expuesto a la traición.',
      },
      {
        name: 'Hiperresponsabilidad',
        description: 'Moderada: asume carga no por heroísmo sino porque delegar = confiar, y confiar es lo que más teme.',
      },
      {
        name: 'Identidad = producción',
        description: 'Presente pero secundaria. Su identidad está más ligada al control que al rendimiento.',
      },
      {
        name: 'Sin límites',
        description: 'Invertido: el Escéptico sí pone límites, pero son muros defensivos, no asertividad sana.',
      },
    ],
    needs: {
      biochemical: {
        title: 'Necesidad bioquímica',
        items: [
          'Sueño profundo (GABA, melatonina)',
          'Movimiento que descargue adrenalina',
          'Contacto físico seguro (oxitocina)',
          'Alimentación antiinflamatoria',
        ],
        explanation: 'Su bioquímica necesita restaurar los ciclos de sueño profundo para que el GABA y la melatonina regulen la hipervigilancia, movimiento que descargue la adrenalina acumulada, contacto físico seguro que active la oxitocina inhibida por la desconfianza, y alimentación que estabilice los picos de cortisol.',
      },
      nervousSystem: {
        title: 'Necesidad del sistema nervioso',
        items: [
          'Seguridad',
          'Estabilidad',
          'Consistencia',
          'Orden y previsibilidad',
        ],
        explanation: 'Para volver a la ventana de tolerancia necesita experiencias repetidas de seguridad que su neurocepción pueda registrar, estabilidad y consistencia en las señales del entorno para que el nervio vago ventral se active gradualmente.',
      },
      emotional: {
        title: 'Necesidad emocional',
        items: [
          'Confianza',
          'Calidez',
          'Empatía',
          'Ser comprendido',
        ],
        explanation: 'La herida de la traición dejó al Escéptico con un déficit profundo de confianza, que es la necesidad emocional más urgente y la más difícil de restaurar. Necesita calidez como experiencia que su neurocepción pueda ir registrando como segura.',
      },
    },
  },
  {
    id: 2,
    key: 'obsesivo',
    name: 'Obsesión',
    descriptors: 'Control · Obsesión · Inflexibilidad · Tensión',
    group: 'Humillados',
    wound: 'Humillación',
    armor: 'Control absoluto',
    snState: 'Hiperactivación prefrontal — déficit de serotonina y GABA',
    narrative: 'En algún momento de tu historia ocurrió algo que no pudiste prever, y ese algo te destrozó. Quizá fue un padre impredecible cuyo humor cambiaba sin aviso, un entorno donde las reglas se movían sin explicación, una pérdida que cayó del cielo sin darle tiempo a tu cuerpo de prepararse. Tu sistema nervioso extrajo una conclusión brutal de esa experiencia: si no lo vi venir, no pude protegerme.\n\nY a partir de ahí tomó una decisión que ya no te consultó, nunca más serás sorprendido. Convirtió tu mente en su herramienta de supervivencia más sofisticada y más agotadora.\n\nNo piensas por placer ni por curiosidad, piensas porque dejar de pensar significa perder el control, y perder el control significa quedar expuesto a ese caos original que tu cuerpo nunca olvidó. La obsesividad mental es el intento desesperado de tu biología por predecir lo que viene y controlar el resultado final.\n\nPero el precio es brutal: vives encerrado en una cárcel de escenarios que nunca suceden mientras la vida real pasa al otro lado de los barrotes que tú mismo construiste.',
    centralBelief: 'Debo mantener el control a toda costa para evitar el castigo.',
    healingBelief: 'Puedo soltar el control y expresar mis emociones sin temor.',
    fears: [
      'Perder el autocontrol y enfrentarse a impulsos reprimidos',
      'Angustia ante cambios, lo inesperado y la incertidumbre',
    ],
    teaser: 'La obsesividad mental ES hiperactivación cognitiva. Tu mente no para de ejecutar algoritmos de seguridad: anticipar todos los escenarios posibles.',
    patterns: [
      {
        name: 'Hiperactivación',
        description: 'La obsesividad mental ES hiperactivación cognitiva. Su mente no para de ejecutar «algoritmos de seguridad»: anticipar todos los escenarios posibles.',
      },
      {
        name: 'Perfeccionismo',
        description: 'El control disfrazado de excelencia. Si cada variable está controlada, lo imprevisto no puede entrar.',
      },
      {
        name: 'Negación del cuerpo',
        description: 'Rigidez somática crónica: mandíbula apretada, pelvis bloqueada, hombros tensos. El cuerpo entero está en modo contención permanente.',
      },
      {
        name: 'Identidad = producción',
        description: 'Si no controlo y produzco, no existo. La productividad es la prueba de que tiene el control.',
      },
      {
        name: 'Hiperresponsabilidad',
        description: 'No delega porque nadie va a hacerlo con el nivel de control que él necesita.',
      },
      {
        name: 'Sin límites',
        description: 'Pone límites, pero desde la rigidez. No es asertividad flexible: es un muro de normas inflexibles.',
      },
    ],
    needs: {
      biochemical: {
        title: 'Necesidad bioquímica',
        items: [
          'Movimiento que libere hipertonía',
          'Sueño reparador sin obsesividad mental',
          'Contacto que desbloquee rigidez',
          'Expresión sexual liberadora',
        ],
        explanation: 'Mantiene un tono simpático permanente con hiperactividad prefrontal. Necesita movimiento físico que libere la hipertonía muscular crónica, sueño que permita consolidación sin obsesividad mental, y contacto que desbloquee la rigidez somática del control.',
      },
      nervousSystem: {
        title: 'Necesidad del sistema nervioso',
        items: [
          'Facilidad y fluidez',
          'Espontaneidad',
          'Armonía interna',
          'Espacio para soltar',
        ],
        explanation: 'Necesita salir de la hiperactivación cortical hacia la regulación ventral vagal. Requiere facilidad como experiencia somática de soltar, espontaneidad que reprograme la ecuación \'lo imprevisto = peligro\'.',
      },
      emotional: {
        title: 'Necesidad emocional',
        items: [
          'Libertad',
          'Alegría',
          'Humor y ligereza',
          'Aceptación de lo imperfecto',
        ],
        explanation: 'La herida de la humillación robó la capacidad de soltar. Su necesidad más profunda es libertad como experiencia interna de que puede existir sin controlarlo todo. Necesita alegría como acción espontánea que no requiera permiso.',
      },
    },
  },
  {
    id: 3,
    key: 'perfeccionista',
    name: 'Perfeccionismo',
    descriptors: 'Exigencia · Insatisfacción · Agotamiento · Implacabilidad · Severidad',
    group: 'Vulnerables',
    wound: 'Desprotección',
    armor: 'Perfección (amor condicionado al rendimiento)',
    snState: 'Simpático sostenido — exceso de dopamina y cortisol crónico',
    narrative: 'En algún momento de tu historia aprendiste que el amor, la aceptación o la seguridad no eran gratuitos, se ganaban con resultados. Quizá fue un padre que solo mostraba orgullo cuando sacabas un diez, un entorno donde el error se castigaba con frialdad o desprecio, una infancia donde ser suficiente nunca fue suficiente.\n\nTu sistema nervioso extrajo una conclusión devastadora: mi valor depende de mi rendimiento. Y a partir de ahí construyó una maquinaria imparable que hoy te gobierna.\n\nEres brutalmente exigente, no por ambición sino por terror. Eres crónicamente insatisfecho, ningún logro llena, ningún resultado basta. Eres implacable contigo mismo, cada error no es un tropiezo sino una confirmación de lo que más temes. Eres incansable, no paras porque parar significa enfrentarte al vacío que hay debajo de todo el hacer.\n\nY lo más trágico es que la perfección que persigues no existe, y cada paso que das hacia ella te aleja un paso más de lo único que realmente necesitabas desde el principio: saber que eres suficiente sin tener que hacer absolutamente nada.',
    centralBelief: 'Mi valor depende de mi rendimiento.',
    healingBelief: 'Soy valioso por quien soy, no por lo que logro.',
    fears: [
      'Ser ineficaz o fracasado',
      'Sentirse inferior, insuficiente o no ser admirado',
      'La crítica que confirme que no vale lo suficiente',
    ],
    teaser: 'El patrón definitorio: «Mi valor depende de mi rendimiento.» El error no toca la conducta: toca la identidad.',
    patterns: [
      {
        name: 'Perfeccionismo',
        description: 'El patrón definitorio. «Mi valor depende de mi rendimiento» es la creencia fundacional. El error no toca la conducta: toca la identidad.',
      },
      {
        name: 'Identidad = producción',
        description: 'Fusión total: soy lo que logro. Sin función profesional, vacío existencial. Es el mecanismo de defensa donde este patrón es más puro.',
      },
      {
        name: 'Hiperactivación',
        description: 'Parar = enfrentarse al vacío que hay debajo del hacer. La agenda llena es anestesia contra la pregunta «¿quién soy sin mis logros?»',
      },
      {
        name: 'Hiperresponsabilidad',
        description: '«Si no lo hago yo perfecto, no se hace bien.» Cada oportunidad delegada es una oportunidad de que algo no salga impecable.',
      },
      {
        name: 'Sin límites',
        description: 'Dice sí a todo porque cada proyecto es una oportunidad de demostrar valor. Decir no = renunciar a demostrar que es suficiente.',
      },
      {
        name: 'Negación del cuerpo',
        description: 'El cuerpo es un obstáculo para la productividad. Se alimenta, duerme y se mueve lo mínimo para seguir rindiendo.',
      },
    ],
    needs: {
      biochemical: {
        title: 'Necesidad bioquímica',
        items: [
          'Descanso real sin culpa',
          'Nutrición sin restricción punitiva',
          'Movimiento gozoso no competitivo',
          'Contacto incondicional',
        ],
        explanation: 'Opera en modo simpático sostenido con dopamina orientada exclusivamente al logro y cortisol crónico por autoexigencia. Necesita descanso real sin que el sistema lo interprete como fracaso.',
      },
      nervousSystem: {
        title: 'Necesidad del sistema nervioso',
        items: [
          'Permiso para parar',
          'Belleza sin utilidad',
          'Armonía interna',
          'Inspiración genuina',
        ],
        explanation: 'Confunde la activación simpática con productividad. Necesita facilidad y permiso para parar como señal de que detenerse no equivale a morir, y belleza sin utilidad que reconecte con el placer estético desvinculado del rendimiento.',
      },
      emotional: {
        title: 'Necesidad emocional',
        items: [
          'Autoaceptación',
          'Autenticidad',
          'Compasión hacia sí mismo',
          'Importar por ser, no por hacer',
        ],
        explanation: 'La herida de la desprotección dejó un déficit de aceptación incondicional. Necesita autenticidad como permiso para existir sin fachada, compasión que repare la crueldad del crítico interno.',
      },
    },
  },
  {
    id: 4,
    key: 'dependiente',
    name: 'Dependencia',
    descriptors: 'Necesidad · Fusión · Entrega · Codependencia · Apego · Complacencia',
    group: 'Necesitados',
    wound: 'Abandono',
    armor: 'Dependencia',
    snState: 'Desregulación HPA — sistema nervioso que se calma en compañía',
    narrative: 'En algún momento de tu historia aprendiste que existir solo no era seguro, y que la única forma de sobrevivir era a través de otro. Quizá fue una madre que te necesitaba más de lo que tú la necesitabas a ella, un hogar donde el amor se ganaba cuidando las emociones de los demás, una infancia donde nadie reguló tu mundo interior y tuviste que buscar esa regulación fuera.\n\nTu sistema nervioso extrajo una conclusión que ya no te consultó: solo no puedo, sin el otro me desintegro. Y a partir de ahí construyó un modo de funcionar que hoy confundes con tu personalidad.\n\nEres profundamente necesitado, no por capricho sino por supervivencia, tu cuerpo siente la ausencia del otro como una emergencia biológica real. Eres fusionado, no sabes existir como entidad separada. Eres codependiente, regulas al otro para regularte a ti mismo.\n\nY lo más doloroso es que esa entrega total que confundes con amor es en realidad la estrategia desesperada de un sistema nervioso que nunca aprendió la lección más importante, que puedes sostenerte solo.',
    centralBelief: 'No puedo vivir sin ser cuidado. Solo no puedo, sin el otro me desintegro.',
    healingBelief: 'Puedo nutrirme a mí mismo.',
    fears: [
      'El abandono y la privación afectiva',
      'Sentirse solo y desprotegido',
      'Que el otro se vaya',
    ],
    teaser: 'Decir no = arriesgarse al abandono. Si pongo un límite, el otro puede irse. Y si se va, me desintegro.',
    patterns: [
      {
        name: 'Sin límites',
        description: 'Decir no = arriesgarse al abandono. Si pongo un límite, el otro puede irse. Y si se va, me desintegro.',
      },
      {
        name: 'Hiperresponsabilidad',
        description: 'Hacerse imprescindible para que no te dejen. Si cargo con todo, nadie puede prescindir de mí.',
      },
      {
        name: 'Identidad = producción',
        description: 'Orientada al otro: valgo lo que hago POR los demás. Mi producción no es para mí sino para retener al otro.',
      },
      {
        name: 'Hiperactivación',
        description: 'Ansiedad de separación: cualquier señal de distancia emocional del otro dispara la alarma simpática.',
      },
      {
        name: 'Perfeccionismo',
        description: 'Moderado. La perfección no es el motor; la conexión sí. Pero puede aparecer como «si lo hago perfecto, no me abandonarán».',
      },
      {
        name: 'Negación del cuerpo',
        description: 'El Dependiente siente su cuerpo intensamente. Lo que siente es ansiedad de separación, no anestesia.',
      },
    ],
    needs: {
      biochemical: {
        title: 'Necesidad bioquímica',
        items: [
          'Nutrición autónoma estabilizadora',
          'Descanso sin depender del otro',
          'Contacto físico sin fusión',
          'Movimiento individual fortalecedor',
        ],
        explanation: 'Presenta desregulación del eje HPA con hiperactividad del sistema de apego. Necesita aprender a nutrirse de forma autónoma, descansar sin depender de la presencia del otro para activar el parasimpático.',
      },
      nervousSystem: {
        title: 'Necesidad del sistema nervioso',
        items: [
          'Seguridad interna propia',
          'Estabilidad propia',
          'Independencia regulatoria',
          'Espacio propio',
        ],
        explanation: 'Tiene su regulación secuestrada por el otro (corregulación unidireccional). Necesita construir seguridad interna como recurso propio y no prestado, y estabilidad que no dependa de la presencia del otro.',
      },
      emotional: {
        title: 'Necesidad emocional',
        items: [
          'Autonutrición',
          'Autorrespeto',
          'Pertenencia sin fusión',
          'Ser conocido sin perderse',
        ],
        explanation: 'La herida del abandono dejó un vacío de autonutrición que busca llenar a través del otro. Necesita autorrespeto como descubrimiento de que sus propios límites son válidos.',
      },
    },
  },
  {
    id: 5,
    key: 'sumiso',
    name: 'Sumisión',
    descriptors: 'Sacrificio · Obediencia · Resignación · Silencio · Invisibilidad · Anulación',
    group: 'Necesitados',
    wound: 'Vergüenza + opresión',
    armor: 'Sumisión',
    snState: 'Congelado entre activación (rabia reprimida) y apagón del cuerpo',
    narrative: 'En algún momento de tu historia aprendiste que tener voz era peligroso, que expresar una necesidad, una opinión o un límite traía consecuencias que tu cuerpo no podía permitirse. Quizá fue un hogar donde el conflicto terminaba en gritos o en violencia, un padre cuya ira se activaba cuando alguien cuestionaba su autoridad, una madre que castigaba con silencio.\n\nTu sistema nervioso extrajo una conclusión que marcó el resto de tu vida: si me someto, sobrevivo. Y a partir de ahí construyó una arquitectura de rendición que hoy gobierna cada una de tus relaciones.\n\nEres sumiso, no por debilidad sino porque la sumisión fue la estrategia que te mantuvo vivo cuando resistir no era una opción. Eres callado, tienes voz pero aprendiste que usarla tenía un precio. Eres un tragador, te tragas la rabia, la opinión, la necesidad, y ese tragar constante es lo que tu cuerpo convierte en tensión y enfermedad.\n\nY lo más devastador es que esa anulación fue tan gradual, tan temprana y tan completa que hoy ni siquiera la vives como pérdida, porque para perder algo primero necesitas saber que lo tenías.',
    centralBelief: 'Mis deseos son vergonzosos. No tengo derecho a ser libre. Si me someto, sobrevivo.',
    healingBelief: 'Mis necesidades son válidas. Tengo derecho a ser libre y expresar mis deseos.',
    fears: [
      'Ser humillado, explotado, controlado o reprimido',
      'Ridiculizado o menospreciado',
      'La pérdida de control y el desamparo',
    ],
    teaser: 'El «no» fue amputado en la infancia. Expresar una necesidad, una opinión o un límite traía castigo. La voz fue suprimida.',
    patterns: [
      {
        name: 'Sin límites',
        description: 'El «no» fue amputado en la infancia. Expresar una necesidad, una opinión o un límite traía castigo. La voz fue suprimida.',
      },
      {
        name: 'Negación del cuerpo',
        description: 'El cuerpo es el depósito de toda la rabia tragada. La tensión muscular crónica es ira reprimida convertida en inflamación silenciosa.',
      },
      {
        name: 'Hiperresponsabilidad',
        description: 'Invertida: no desde el heroísmo sino desde la obligación. «Si no lo hago, habrá consecuencias.»',
      },
      {
        name: 'Identidad = producción',
        description: 'Versión sumisa: «valgo lo que aguanto», no «valgo lo que produzco». Su valor es la resistencia, no el logro.',
      },
      {
        name: 'Perfeccionismo',
        description: 'Bajo: no busca perfección sino supervivencia. Solo aparece como «si no doy motivos de queja, estaré seguro».',
      },
      {
        name: 'Hiperactivación',
        description: 'Paradójica: calma exterior pero por dentro hay activación simpática reprimida que se somatiza.',
      },
    ],
    needs: {
      biochemical: {
        title: 'Necesidad bioquímica',
        items: [
          'Expresión corporal libre',
          'Contacto donde él decida',
          'Descanso sin culpa ni servicio',
          'Alimentación por placer propio',
        ],
        explanation: 'Acumula tensión muscular crónica por represión de la ira (cortisol e inflamación silenciosa). Necesita expresión corporal libre que descargue la rabia acumulada en la musculatura.',
      },
      nervousSystem: {
        title: 'Necesidad del sistema nervioso',
        items: [
          'Elección propia',
          'Libertad',
          'Espacio personal',
          'Espontaneidad',
        ],
        explanation: 'Está congelado entre la activación (rabia reprimida) y el colapso dorsal (sumisión). Necesita elección propia como experiencia corporal de agencia, y libertad para que el sistema registre que decir \'no\' no trae aniquilación.',
      },
      emotional: {
        title: 'Necesidad emocional',
        items: [
          'Autoexpresión',
          'Dignidad y valor propio',
          'Ser visto',
          'Participación activa',
        ],
        explanation: 'La herida de la vergüenza y la opresión dejaron sin autoexpresión, la necesidad más borrada de su mapa emocional. Necesita dignidad como experiencia corporal de que sus necesidades importan.',
      },
    },
  },
  {
    id: 6,
    key: 'autosuficiente',
    name: 'Autosuficiencia',
    descriptors: 'Desconexión · Soledad · Inaccesibilidad · Intocabilidad',
    group: 'Rechazados',
    wound: 'Rechazo',
    armor: 'Autosuficiencia (apagón emocional)',
    snState: 'Desconexión del cuerpo — apagón parasimpático, disociación, aplanamiento afectivo',
    narrative: 'En algún momento de tu historia necesitaste a alguien, con toda la desesperación de la que es capaz un ser humano, y esa persona no estuvo. Quizá fue un padre que se fue sin explicación, una madre que estaba físicamente presente pero emocionalmente en otro planeta, un cuidador que respondía a tu necesidad con indiferencia.\n\nTu sistema nervioso extrajo la conclusión más solitaria de todas: necesitar duele más que no tener. Y a partir de ahí ejecutó un apagón emocional que hoy confundes con fortaleza.\n\nEres autosuficiente, no porque hayas aprendido a sostenerte sino porque tu biología decidió que depender de alguien era un riesgo que nunca más correría. Eres desconectado, cortaste los cables emocionales. Eres solitario, convertiste la soledad en refugio. Eres intocable, nadie te toca porque tocar implica sentir.\n\nY lo más trágico es que esa autosuficiencia que exhibes como tu mayor virtud es en realidad tu herida más profunda disfrazada de coraza, porque no hay nada más doloroso que un ser humano que necesita desesperadamente conectar y cuyo sistema nervioso le ha prohibido hacerlo para siempre.',
    centralBelief: 'No tengo derecho a existir. Necesitar duele más que no tener.',
    healingBelief: 'Tengo derecho a existir y ser aceptado.',
    fears: [
      'Ser destruido o aniquilado',
      'Perder su identidad y autonomía a través de la cercanía emocional',
      'El contacto como amenaza',
    ],
    teaser: 'El cuerpo fue anestesiado porque sentir era demasiado peligroso. Necesitar dolía más que no tener. El apagón somático es total.',
    patterns: [
      {
        name: 'Negación del cuerpo',
        description: 'El cuerpo fue anestesiado porque sentir era demasiado peligroso. Necesitar dolía más que no tener. El apagón somático es total.',
      },
      {
        name: 'Identidad = producción',
        description: 'La productividad como sustituto de la conexión: si no puedo conectar con personas, al menos puedo producir resultados.',
      },
      {
        name: 'Perfeccionismo',
        description: 'Orientado a la autonomía: «si lo hago perfecto, no necesito a nadie». La perfección garantiza que no haya dependencia.',
      },
      {
        name: 'Hiperresponsabilidad',
        description: 'No asume la carga de otros porque la relación no le interesa. Solo asume lo suyo, pero lo asume solo.',
      },
      {
        name: 'Hiperactivación',
        description: 'Su estado dominante es dorsal vagal (apagón), no simpático. Se quema por vacío, no por exceso.',
      },
      {
        name: 'Sin límites',
        description: 'Invertido: el Autosuficiente pone límites de sobra. Pero son muros que impiden la conexión, no límites sanos.',
      },
    ],
    needs: {
      biochemical: {
        title: 'Necesidad bioquímica',
        items: [
          'Contacto físico gradual y seguro',
          'Alimentación como autocuidado',
          'Descanso sin hipervigilancia',
          'Movimiento que reconecte con el cuerpo',
        ],
        explanation: 'Opera en dorsal vagal. Necesita contacto físico gradual que reactive la oxitocina sin disparar la alarma, alimentación como acto consciente de autocuidado, y movimiento que reconecte con sensaciones corporales anestesiadas.',
      },
      nervousSystem: {
        title: 'Necesidad del sistema nervioso',
        items: [
          'Seguridad para sentir',
          'Calidez regulada',
          'Conexión gradual',
          'Presencia sin invasión',
        ],
        explanation: 'Está colapsado en dorsal vagal (desconexión, aplanamiento, disociación). Necesita seguridad para sentir porque su neurocepción interpreta el sentir como amenaza, y calidez regulada en dosis que no disparen el reflejo de huida.',
      },
      emotional: {
        title: 'Necesidad emocional',
        items: [
          'Pertenencia',
          'Aceptación',
          'Intimidad sin aniquilación',
          'Ser visto sin ser destruido',
        ],
        explanation: 'La herida del rechazo dejó sin pertenencia, la necesidad que su sistema consideró demasiado peligrosa. Necesita aceptación como experiencia de que su existencia es bienvenida.',
      },
    },
  },
  {
    id: 7,
    key: 'arrogante',
    name: 'Arrogancia',
    descriptors: 'Soberbia · Crítica · Intelectualización · Infranqueabilidad',
    group: 'Vulnerables',
    wound: 'Impotencia',
    armor: 'Superioridad',
    snState: 'Simpático dominante — exceso de testosterona y dopamina',
    narrative: 'En algún momento de tu historia alguien te hizo sentir pequeño, tan pequeño que tu sistema nervioso juró que nunca más nadie tendría el poder de hacerte sentir así. Quizá fue un padre que te humillaba delante de otros, un entorno escolar donde fuiste el débil, una familia donde tu sensibilidad se ridiculizaba como defecto.\n\nTu sistema nervioso extrajo una conclusión que reconfiguró tu personalidad entera: si estoy arriba nadie me alcanza, y si nadie me alcanza nadie me hiere. Y a partir de ahí construyó una torre de superioridad que hoy el mundo confunde con tu carácter.\n\nEres soberbio, pero esa soberbia no es ego sino escudo. Eres crítico, juzgas a todos porque mientras juzgas nadie te juzga a ti. Eres intelectual, usas la mente como trinchera, racionalizas todo para no sentir nada. Y eres infranqueable, la superioridad funciona como foso y muralla contra la intimidad.\n\nY lo más devastador de este mecanismo de defensa es que funciona, la gente te respeta, te teme, te admira desde lejos, y esa distancia que interpretas como victoria es exactamente la condena que tu sistema nervioso diseñó sin consultarte.',
    centralBelief: 'Debo demostrar superioridad para ser digno y no quedar expuesto como impostor.',
    healingBelief: 'Soy valioso por quien soy; puedo conectar con mi vulnerabilidad y seguir siendo digno.',
    fears: [
      'Sentirse impotente, insignificante o humillado',
      'Colapso del self grandioso y exposición de su vulnerabilidad real',
    ],
    teaser: 'Competitivo: no busca perfección por miedo al error sino por necesidad de superioridad. «Si soy el mejor, nadie puede hacerme pequeño.»',
    patterns: [
      {
        name: 'Perfeccionismo',
        description: 'Competitivo: no busca perfección por miedo al error sino por necesidad de superioridad. «Si soy el mejor, nadie puede hacerme pequeño.»',
      },
      {
        name: 'Identidad = producción',
        description: 'Doble: «valgo lo que logro Y lo que los demás no logran». La identidad depende de producir más que todos.',
      },
      {
        name: 'Hiperactivación',
        description: 'Orientada a dominancia: testosterona + dopamina competitiva. No es ansiedad sino impulso de estar siempre arriba.',
      },
      {
        name: 'Hiperresponsabilidad',
        description: 'Selectiva: asume el mérito, no la carga. Lidera desde arriba, no desde el servicio.',
      },
      {
        name: 'Negación del cuerpo',
        description: 'Parcial: el cuerpo es exhibición (torso expandido, presencia imponente) pero no sensación. Pelvis retraída, cuello rígido.',
      },
      {
        name: 'Sin límites',
        description: 'Pone límites sin problema, pero desde la superioridad y el desdén, no desde la igualdad.',
      },
    ],
    needs: {
      biochemical: {
        title: 'Necesidad bioquímica',
        items: [
          'Contacto que permita vulnerabilidad',
          'Movimiento no competitivo',
          'Descanso sin justificación',
          'Expresión corporal auténtica',
        ],
        explanation: 'Mantiene activación simpática orientada a la dominancia con bloqueo de tristeza y vergüenza. Necesita contacto físico que permita bajar la guardia y experimentar vulnerabilidad sin colapso.',
      },
      nervousSystem: {
        title: 'Necesidad del sistema nervioso',
        items: [
          'Comunión con otros',
          'Igualdad relacional',
          'Armonía sin jerarquía',
          'Facilidad para sentir',
        ],
        explanation: 'Está en modo simpático de dominancia (la mejor defensa es el ataque). Necesita comunión como experiencia de igualdad que desactive la jerarquía defensiva, y armonía donde el nervio vago ventral se active en horizontalidad.',
      },
      emotional: {
        title: 'Necesidad emocional',
        items: [
          'Vulnerabilidad segura',
          'Compasión',
          'Mutualidad',
          'Ser conocido de verdad',
        ],
        explanation: 'La herida de la impotencia dejó sin acceso a la vulnerabilidad segura, la necesidad que más teme y más necesita. Requiere compasión que derrita la coraza de superioridad.',
      },
    },
  },
]

// ─── MAPEO P6+P4+P2 → MECANISMO DE DEFENSA ─────────────────────────────────

/**
 * Mapea las respuestas P6 (frase identitaria), P4 (patrón emocional)
 * y P2 (sueño) a uno de los 7 mecanismos de defensa adaptativos.
 *
 * Lógica basada en la matriz de conexiones (arquetipos-conexiones.jpeg):
 * - P6 selecciona el grupo primario (4 perfiles ego → subset de arquetipos)
 * - P4 + P2 refinan al arquetipo específico
 *
 * P6 opciones: A (Productivo Colapsado), B (Fuerte Invisible),
 *              C (Cuidador Exhausto), D (Controlador Paralizado)
 * P4 opciones: A-D (patrones emocionales)
 * P2 opciones: A-D (patrones de sueño)
 */
export function getArchetype(p6: string, p4: string, p2: string): ArchetypeData {
  // P6 = perfil ego primario
  // A = Productivo Colapsado → Perfeccionista o Arrogante
  // B = Fuerte Invisible → Escéptico o Autosuficiente
  // C = Cuidador Exhausto → Dependiente o Sumiso
  // D = Controlador Paralizado → Obsesivo

  switch (p6) {
    case 'A': {
      // Productivo Colapsado: Perfeccionista vs Arrogante
      // P4='A' (ansiedad/agotamiento) → Perfeccionista (se quema solo)
      // P4='B' (irritabilidad) → Arrogante (se quema contra otros)
      // P4='C' (tristeza/vacío) → Perfeccionista (vacío bajo el logro)
      // P4='D' (desconexión) → Arrogante (coraza de superioridad)
      if (p4 === 'B' || p4 === 'D') {
        return ARCHETYPES[6] // Arrogante
      }
      return ARCHETYPES[2] // Perfeccionista
    }

    case 'B': {
      // Fuerte Invisible: Escéptico vs Autosuficiente
      // P2='A'/'B' (duerme mal / tarda en dormirse) → Escéptico (hipervigilancia nocturna)
      // P2='C'/'D' (se despierta / duerme bien) → Autosuficiente (apagón, no vigilancia)
      // P4 refina: desconexión emocional → más Autosuficiente
      if (p4 === 'D' || (p2 === 'C' && p4 !== 'A')) {
        return ARCHETYPES[5] // Autosuficiente
      }
      return ARCHETYPES[0] // Escéptico
    }

    case 'C': {
      // Cuidador Exhausto: Dependiente vs Sumiso
      // P4='A' (ansiedad) → Dependiente (ansiedad de separación)
      // P4='C' (tristeza) → Dependiente (pérdida)
      // P4='B' (irritabilidad) → Sumiso (rabia reprimida)
      // P4='D' (desconexión) → Sumiso (fawning/shutdown)
      if (p4 === 'B' || p4 === 'D') {
        return ARCHETYPES[4] // Sumiso
      }
      return ARCHETYPES[3] // Dependiente
    }

    case 'D': {
      // Controlador Paralizado → Obsesivo (mapeo directo)
      return ARCHETYPES[1] // Obsesivo
    }

    default:
      // Fallback: Perfeccionista (el más común en ejecutivos con burnout)
      return ARCHETYPES[2]
  }
}

/** Obtiene un mecanismo de defensa por su key */
export function getArchetypeByKey(key: string): ArchetypeData | undefined {
  return ARCHETYPES.find((a) => a.key === key)
}

/** Todos los mecanismos de defensa (para admin/debug) */
export function getAllArchetypes(): ArchetypeData[] {
  return ARCHETYPES
}
