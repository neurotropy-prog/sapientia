# M7 — CTA COMO ALIVIO (actualización v2)

**Sustituye la sección M7 original (líneas 950–991 de FEATURE_GATEWAY_DESIGN.md).**

**Cambio principal:** Entre las 5 dimensiones del resultado y el CTA se insertan dos bloques nuevos — la timeline de 3 fases y el reencuadre de precio — que dan horizonte completo al programa y potencian los 97€ como puerta de entrada.

**Justificación por SKILLs:**

| SKILL | Principio | Cómo se aplica |
|---|---|---|
| movement-philosophy | Precio obvio + Claridad de proceso | La persona ve el rango de precio y las 3 fases. Sin incertidumbre. |
| movement-philosophy | Alivio calibrado contra tensión | El delta "desde 2.500€ → prueba por 97€ con garantía" genera refuerzo desproporcionado. |
| movement-philosophy | Resistencia por confusión | Eliminada. Un solo CTA, un solo precio de acción. El rango es contexto, no decisión. |
| product-philosophy | UNA acción principal por pantalla | El botón de 97€ es la ÚNICA acción. Los planes no aparecen como opciones. |
| product-philosophy | Complejidad ganada | La selección de plan (Executive/Premium/Privado) se revela DESPUÉS de la Semana 1. |
| gateway | CTA como alivio | Después de ver "desde 2.500€", los 97€ son alivio estructural. |
| gateway | Cascada de valor | Los 97€ = nivel intermedio entre N1 y N3. Experiencial, no pasivo. Valor completo. |
| profiles | Los 4 perfiles | Productivo: ROI claro. Fuerte: transparencia. Cuidador: culpa reducida. Controlador: estructura total. |

---

## M7 — CTA COMO ALIVIO

La M7 tiene ahora 3 bloques que se experimentan como una sola secuencia fluida. Los bloques se leen de arriba a abajo dentro del Mapa Vivo, después de las 5 dimensiones + cascada de valor + puentes líquidos.

```
SECUENCIA VISUAL:

  [5 dimensiones + insights + puentes]
          ↓
  [BLOQUE A — Timeline de 3 fases]     ← NUEVO
          ↓
  [BLOQUE B — Reencuadre de precio]    ← NUEVO
          ↓
  [BLOQUE C — CTA + Semana 1]          ← actualizado
```

---

### BLOQUE A — Timeline: las 3 fases del programa

**Lo que ve (después de las dimensiones y los puentes, con espacio generoso arriba):**

**Headline (Cormorant Garamond, h3):**
> Tu regulación es un proceso de 12 semanas. Tu primer paso son los próximos 7 días.

**Visualización — Timeline de 3 fases:**

Layout mobile-first (375px): vertical, con línea de progreso a la izquierda. Layout desktop: horizontal, con línea de progreso abajo. Cada fase es una card.

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ● ─── FASE 1 ─────── ○ ─── FASE 2 ─────── ○ ─── FASE 3     │
│        (iluminada)          (atenuada)          (atenuada)     │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ AQUÍ EMPIEZAS    │  │                  │  │                  │  │
│  │                  │  │                  │  │                  │  │
│  │ EL DESPERTAR     │  │ LA METAMORFOSIS  │  │ VOLAR ALTO      │  │
│  │ Semanas 1–4      │  │ Semanas 5–8      │  │ Semanas 9–12    │  │
│  │                  │  │                  │  │                  │  │
│  │ Reconocer y      │  │ Activar y        │  │ Conectar y      │  │
│  │ estabilizar      │  │ procesar         │  │ reconstruir     │  │
│  │                  │  │                  │  │                  │  │
│  │ [texto]          │  │ [texto]          │  │ [texto]         │  │
│  │                  │  │                  │  │                  │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Card Fase 1 — El Despertar (activa: borde verde acento, fondo bg-secondary):**

Badge (caption, verde acento): `AQUÍ EMPIEZAS`

Título (Inter, body-lg, bold, text-primary): El Despertar

Subtítulo (caption, secondary): Semanas 1–4 · Reconocer y estabilizar

Texto (body-sm, tertiary):
> Entenderás qué le pasa a tu biología: neurotransmisores, función hormonal, inflamación. Restaurarás tu sueño con un protocolo diseñado por un médico. En la semana 4, tu primer balance formal confirmará lo que tu cuerpo ya empieza a notar.

**Card Fase 2 — La Metamorfosis (atenuada: opacity 0.5, sin borde verde):**

Título (Inter, body-lg, bold, text-secondary): La Metamorfosis

Subtítulo (caption, tertiary): Semanas 5–8 · Activar y procesar

Texto (body-sm, tertiary):
> Desmontarás las creencias y patrones que sostienen el ciclo. Conocerás las partes internas que dirigen tus decisiones sin que lo sepas — el perfeccionista, el controlador, el crítico — y aprenderás a liderarlas. Lo que el burnout congeló empieza a procesarse.

**Card Fase 3 — Volar Alto (atenuada: opacity 0.5, sin borde verde):**

Título (Inter, body-lg, bold, text-secondary): Volar Alto

Subtítulo (caption, tertiary): Semanas 9–12 · Conectar y reconstruir

Texto (body-sm, tertiary):
> Repararás los vínculos que el burnout dañó, pondrás límites desde tus valores y diseñarás tu nueva arquitectura vital. Un sistema de alertas tempranas para que el burnout no vuelva.

**Notas de diseño:**
- La Fase 1 tiene presencia visual dominante. Las otras dos son contexto — visibles pero no protagonistas.
- En mobile (375px): las 3 cards se apilan verticalmente con una línea de progreso verde a la izquierda. El nodo de Fase 1 es un círculo relleno (●). Los nodos de Fase 2 y 3 son círculos vacíos (○).
- En desktop: layout horizontal, las 3 cards en fila, con línea de progreso debajo conectando los nodos.
- El badge "AQUÍ EMPIEZAS" está sobre la card de Fase 1, en verde acento, tipo label. No aparece en las otras.
- Las cards de Fase 2 y 3 tienen la misma estructura pero con opacity reducida (0.5) y sin borde verde. Comunican "esto viene después" sin competir por atención.
- Transición: CSS fade-in suave (300ms) cuando la sección entra en viewport. Las fases aparecen secuencialmente (Fase 1 primero, 150ms delay Fase 2, 300ms delay Fase 3) para reforzar la idea de progresión.

---

### BLOQUE B — Reencuadre de precio

**Lo que ve (inmediatamente debajo de la timeline, sin separador visual fuerte — es continuación natural):**

**Texto (Inter, body, text-primary):**
> El programa completo tiene tres niveles de acompañamiento desde 2.500€, según la profundidad que necesites. La elección del plan viene después — cuando hayas comprobado con tu propio cuerpo que esto funciona.

**Texto (Inter, body-sm, secondary):**
> Por eso existe la Semana 1.

**Notas de diseño:**
- Son solo dos frases. Nada más. No hay cards de planes. No hay tabla comparativa. No hay opciones. Es información de fondo que responde la pregunta "¿y después cuánto cuesta?" sin crear una decisión nueva.
- "Desde 2.500€" es el ancla. Los 97€ que vienen justo debajo se perciben contra ese contraste.
- "La elección del plan viene después" cierra EXPLÍCITAMENTE la puerta a la parálisis por análisis. El Controlador Paralizado necesita oír esto para poder decidir sobre los 97€ sin sentir que le falta información.
- "Cuando hayas comprobado con tu propio cuerpo" refuerza que los 97€ no son un compromiso ciego — son una prueba con resultados medibles. Movement-philosophy: "experiencia directa de éxito genera más confianza que cualquier prueba social."

**Validación ética:**
- Test de verdad: Los precios son los reales. ✅
- Test de poder: La persona sale con más información para decidir. ✅
- Test de reversibilidad: Es transparencia pura. Si la persona viera cómo diseñamos esto, pensaría "me están mostrando todo antes de pedirme nada." ✅
- Test de beneficio: Reduce la incertidumbre del cliente. Beneficio principal para él. ✅

---

### BLOQUE C — El CTA (Semana 1)

**Lo que ve (debajo del reencuadre, con espacio generoso arriba — respiro visual entre el precio del programa y el CTA):**

**Texto pre-CTA (Cormorant Garamond, h3, italic):**
> Tu sistema nervioso lleva años sosteniendo lo que tú no podías soltar. Ahora tienes el mapa.

**Texto delta de alivio (Inter, body, text-primary):**
> Los primeros cambios llegan en 72 horas. No en meses — en 3 días. El Protocolo de Sueño de Emergencia está diseñado para que tu cuerpo note la diferencia antes de que tu mente decida si confía.

**Botón CTA (primario, pill verde, large):**
> Empieza la Semana 1

**Texto post-CTA (body-sm, tertiary):**
> 97€ · Protocolo de Sueño de Emergencia + Sesión 1:1 con Javier + Mapa de Niveles de Neurotransmisores (MNN©) · Garantía de 7 días

**Debajo, más pequeño (caption, tertiary):**
> Si tu sueño no mejora en 7 días, te devolvemos los 97€. Sin preguntas.

**Qué incluye la Semana 1 (card sutil, colapsable):**

```
→ Protocolo de Sueño de Emergencia
  Diseñado por el Dr. Carlos Alvear. Un plan concreto para
  ganar hasta una hora más de sueño al día. Resultados en 72 horas.

→ Sesión 1:1 con Javier A. Martín Ramos
  Director del Instituto Epigenético. Ya tiene tu mapa —
  la sesión arranca desde tus datos, no desde cero.

→ Mapa de Niveles de Neurotransmisores (MNN©)
  Tu primer análisis bioquímico real: qué sustancias produce
  tu cerebro, cuáles le faltan y qué significa eso para tu
  sueño, tu energía y tu claridad mental.

→ Garantía total
  7 días. Si no notas mejora en tu sueño, devolución íntegra.
  Sin preguntas. Sin formularios.
```

**Notas de diseño:**
- El texto pre-CTA es serif, itálica — es la voz de Javier. Empatía, no instrucción.
- El botón dice "Empieza" — acción, movimiento. No "Comprar", "Suscribirse", "Inscribirse."
- El precio + garantía van debajo en terciario. Visibles para el Controlador, no protagonistas.
- La card de contenido es colapsable — el que necesita saber qué incluye lo abre. El que está listo, hace clic directamente.
- Cada ítem de la card incluye una frase de contexto que traduce la sigla o el nombre técnico a lenguaje que cualquiera entiende. MNN© siempre va acompañado de "Mapa de Niveles de Neurotransmisores" + una línea que explica qué es en lenguaje común.

---

### Regla de lenguaje: MNN©

En TODO el sistema (gateway, mapa vivo, emails, landing), MNN© se menciona SIEMPRE con su nombre completo la primera vez que aparece en cada contexto:

```
PRIMERA MENCIÓN en cada contexto:
  "Mapa de Niveles de Neurotransmisores (MNN©)"

MENCIONES POSTERIORES en el mismo contexto:
  "MNN©" solo — si ya se explicó arriba en la misma pantalla.

EN TEXTOS BREVES (post-CTA, caption):
  "Mapa de Niveles de Neurotransmisores (MNN©)"
  — siempre completo, sin asumir que se recuerda.

NUNCA:
  "MNN©" solo como primera mención. La persona no sabe
  qué es. Es una metodología propietaria del Instituto
  Epigenético con copyright — sin contexto, es ruido.
```

**Descripción estándar para cuando se necesita explicar (card colapsable, tooltips, etc.):**
> Tu primer análisis bioquímico real: qué sustancias produce tu cerebro, cuáles le faltan y qué significa eso para tu sueño, tu energía y tu claridad mental.

---

### Cadena emocional completa (Bloques A + B + C)

La secuencia genera un arco emocional diseñado:

```
BLOQUE A — Timeline:
  Emoción: "Hay un camino completo. Es serio. Tiene estructura."
  Estado: Confidence reforzada.
  Lo que piensa: "12 semanas, 3 fases, esto no es un parche."

  Para cada perfil:
  - Productivo: "Eficiente. 12 semanas, no terapia indefinida."
  - Fuerte: "Profundo. Biología + mente + arquitectura vital."
  - Cuidador: "Estructurado. Sé exactamente en qué me meto."
  - Controlador: "Puedo ver el mapa entero. Nada es improvisado."

BLOQUE B — Precio:
  Emoción: "Es un high ticket. Pero puedo probarlo primero."
  Estado: Transición de Confidence a Readiness.
  Lo que piensa: "Desde 2.500€... pero la elección viene después."

  Para cada perfil:
  - Productivo: "ROI brutal si funciona. Y puedo probar por 97€."
  - Fuerte: "Transparentes. No me ocultan nada. Respeto."
  - Cuidador: "Solo 97€ para empezar. No me comprometo al todo."
  - Controlador: "Tengo todos los datos. Puedo decidir seguro."

BLOQUE C — CTA:
  Emoción: "97€ con garantía es... nada. Puedo probarlo."
  Estado: Readiness. El delta de alivio actúa.
  Lo que piensa: "Si el programa vale 2.500€ y puedo entrar
  por 97€ con garantía de devolución... ¿qué estoy esperando?"

  Para cada perfil:
  - Productivo: Clic. Rápido. No necesita más.
  - Fuerte: Abre la card colapsable. Lee los detalles. Clic.
  - Cuidador: Lee la garantía dos veces. Respira. Clic.
  - Controlador: Revisa todo. Timeline. Precio. Card. Garantía. Clic.
```

---

### Depósito de confianza adicional

La M7 actualizada añade un depósito nuevo a la cadena documentada:

```
DEPÓSITO 8 (M7 — Timeline + Precio): "Es transparente"
  Muestra el camino completo Y el rango de precio ANTES de
  pedir nada. No oculta. No manipula. La persona sabe
  exactamente en qué se está metiendo.
  Si falla → "me están vendiendo algo sin decirme cuánto cuesta."
  Si funciona → los 97€ se perciben como oportunidad, no como gasto.
```

---

### Lo que NO hacemos (y por qué)

- **No mostramos los 3 planes (Executive / Premium / Privado) en el Mapa Vivo.** Esa decisión viene después de la Semana 1, cuando la persona tiene resultados y confianza para elegir nivel de acompañamiento. Mostrarlos ahora crea parálisis (product-philosophy: UNA acción principal) y contamina la decisión de los 97€. La selección de plan es complejidad ganada — se revela cuando tiene sentido.

- **No detallamos las 12 semanas una por una.** 3 fases con título + subtítulo + párrafo es suficiente para dar horizonte sin abrumar. 12 semanas individuales es complejidad prematura que activa al Controlador sin darle más información útil para la decisión que tiene delante (los 97€).

- **No usamos "desde 2.500€" como ancla de venta.** Lo usamos como información transparente. La frase "la elección del plan viene después" desactiva cualquier percepción de presión. Es la verdad de la arquitectura del programa, no una técnica.

- **No ponemos la timeline ni el precio en la landing ni en el gateway.** Solo en el Mapa Vivo. La landing tiene un solo trabajo: entrar al gateway. El gateway tiene su propio ritmo de 8 mecánicas. Los bloques nuevos viven donde la persona ya tiene su diagnóstico completo y está evaluando qué hacer.

- **No presentamos los 97€ como "oferta" ni "descuento."** Es la puerta de entrada del programa — así está diseñado. Urgencia ética, no fabricada. Movement-philosophy: "la urgencia ética no manipula — vence la inercia natural."

---

### Métricas adicionales del Mapa Vivo (actualizadas)

A las métricas existentes del mapa vivo se añaden:

```
- Scroll hasta timeline (% de visitantes que llegan al Bloque A): objetivo >70%
- Tiempo en timeline (>5 segundos = lectura real): objetivo >50%
- Apertura card colapsable "Qué incluye" (% de quienes ven el CTA): objetivo >30%
- Conversión Bloque C (clic en "Empieza la Semana 1"): objetivo >15% acumulado 30 días
```

---

*M7 actualizada · FEATURE_GATEWAY_DESIGN.md · v2 · Marzo 2026*
