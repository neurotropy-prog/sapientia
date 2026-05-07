# ANIMATIONS.md — Capa Visual Obligatoria

**Este documento tiene la misma prioridad que la lógica y el contenido.**
**Una pantalla sin sus animaciones NO ESTÁ TERMINADA.**

Antes de cerrar cualquier fase o componente, verificar que TODOS los ítems
de este documento aplicables a esa fase están implementados.

---

## REGLA DE IMPLEMENTACIÓN

Cada componente tiene DOS capas:
1. **CONTENIDO** — copy, estructura, datos, lógica
2. **EXPERIENCIA** — animaciones, transiciones, SVGs, micro-interacciones

Ambas son requisitos de entrega. Si un commit implementa contenido sin experiencia, está incompleto.

**Referencia visual:** functionhealth.com — revelación progresiva de datos de salud, "connective thread" scroll-driven, widgets animados, coreografía secuenciada.

**Anti-patrones (NUNCA):**
- ❌ Corte seco entre pantallas → siempre transición
- ❌ Todo el mismo fondo → 3 zonas emocionales diferentes
- ❌ Spinner genérico → mensaje intencional con typing effect
- ❌ Números estáticos → siempre counter animado
- ❌ Cards que aparecen todas a la vez → siempre stagger
- ❌ Formulario tipo Google Form → diseño editorial por pantalla
- ❌ Texto plano sobre fondo plano = INCOMPLETO

---

## UTILIDADES CSS COMPARTIDAS

Definir estas utilidades una vez e importar en todos los componentes:

```css
/* ============================================
   EASING FUNCTIONS
   ============================================ */
:root {
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ============================================
   ZONAS EMOCIONALES — 3 fondos alternados
   ============================================ */

/* ZONA 1 — EXPLORACIÓN (preguntas) */
/* Fondo: primary, aireado. Sensación: espacio seguro */
.zone-explore {
  background-color: var(--color-bg-primary);
}

/* ZONA 2 — REFLEXIÓN (micro-espejos, primera verdad, bisagra) */
/* Fondo: más oscuro, envolvente. Sensación: el sistema me habla */
.zone-reflect {
  background-color: var(--color-bg-secondary);
}

/* ZONA 3 — REVELACIÓN (resultado, CTA) */
/* Gradiente oscuro→claro con acentos. Sensación: esto es mío */
.zone-reveal {
  background: linear-gradient(
    180deg,
    var(--color-bg-secondary) 0%,
    var(--color-bg-primary) 100%
  );
}

/* Transición entre zonas — SIEMPRE 600ms ease */
[data-zone] {
  transition: background-color 600ms var(--ease-in-out);
}

/* ============================================
   COUNTER ANIMADO (reutilizable)
   ============================================ */
/*
  Implementar como componente JS/React:
  - Props: from (default 0), to, duration (ms), suffix (%, "/100", etc.)
  - Usa requestAnimationFrame
  - Easing: ease-out-expo para que desacelere al llegar al target
  - Se dispara cuando el elemento entra en viewport (IntersectionObserver)
  
  Ejemplo de uso:
  <Counter from={0} to={34} duration={1200} />
  <Counter from={0} to={73} duration={800} suffix="%" />
*/

/* ============================================
   TYPING EFFECT (reutilizable)
   ============================================ */
/*
  Implementar como componente:
  - Props: text, speed (ms por carácter, default 40), delay (ms antes de empezar)
  - Cursor parpadeante al final (blink 530ms)
  - Se usa en: "Analizando tus respuestas...", "Calculando tu perfil..."
  
  CSS del cursor:
*/
.typing-cursor::after {
  content: '|';
  animation: blink 530ms step-end infinite;
  color: var(--color-accent);
}

@keyframes blink {
  50% { opacity: 0; }
}

/* ============================================
   FADE + SLIDE REUTILIZABLES
   ============================================ */
.fade-in {
  animation: fadeIn 400ms var(--ease-out-quart) forwards;
  opacity: 0;
}

.fade-in-up {
  animation: fadeInUp 500ms var(--ease-out-expo) forwards;
  opacity: 0;
}

.slide-in-left {
  animation: slideInLeft 400ms var(--ease-out-expo) forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* ============================================
   STAGGER DELAYS (para grupos de cards)
   ============================================ */
.stagger > :nth-child(1) { animation-delay: 0ms; }
.stagger > :nth-child(2) { animation-delay: 150ms; }
.stagger > :nth-child(3) { animation-delay: 300ms; }
.stagger > :nth-child(4) { animation-delay: 450ms; }
.stagger > :nth-child(5) { animation-delay: 600ms; }
.stagger > :nth-child(6) { animation-delay: 750ms; }

/* ============================================
   BARRA DE PROGRESO ANIMADA
   ============================================ */
/*
  - Height: 3px, fija en top
  - Gradiente de color que evoluciona (neutra → cargada)
  - Width transición: 800ms ease-out-expo
  - Counter animado para el % (opcional)
  - Comportamiento NO LINEAL: avanza en preguntas, PAUSA en revelaciones
  
  Valores por paso:
  P1=10%, P2=20%, Primera Verdad=20% (pausa), P3=35%, P4=45%,
  Micro-espejo 1=50% (pausa), P5=60%, P6=70%, Micro-espejo 2=75% (pausa),
  P7=82%, P8=90%, Bisagra=95% (pausa), Resultado=100%
*/
.progress-bar {
  height: 3px;
  transition: width 800ms var(--ease-out-expo);
  background: linear-gradient(90deg, var(--color-accent), var(--color-accent));
}

/* ============================================
   ACCESIBILIDAD
   ============================================ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## FASE 1 — HERO + LANDING

### A-01: Ilustración SVG del sistema nervioso

**Qué:** SVG abstracto detrás del headline. Red neuronal estilizada — NO anatómico, orgánico, editorial.

**Estructura SVG:**
```
- Inline SVG (no <img>, no background-image) → performance
- 5-8 nodos (circles, r=4-8px) conectados por paths curvos (cubic bezier)
- Color: var(--color-accent) al 20-30% opacity
- Posición: position absolute, behind headline, z-index: 0
- Tamaño: cubre above-the-fold completo
- Móvil (375px): simplificar a 3-5 nodos, 60% ancho viewport
```

**Animación — pulso continuo:**
```css
@keyframes nerve-pulse {
  0%   { opacity: 0.15; }
  50%  { opacity: 0.30; }
  100% { opacity: 0.15; }
}

.nerve-svg { animation: nerve-pulse 3s ease-in-out infinite; }

/* Líneas individuales con delay escalonado para efecto orgánico */
.nerve-line:nth-child(1) { animation-delay: 0s; }
.nerve-line:nth-child(2) { animation-delay: 0.5s; }
.nerve-line:nth-child(3) { animation-delay: 1.0s; }
.nerve-line:nth-child(4) { animation-delay: 1.5s; }
```

**Efecto opcional avanzado — stroke draw-on:**
```css
.nerve-line {
  stroke-dasharray: 300;
  stroke-dashoffset: 300;
  animation: draw 2s var(--ease-out-expo) forwards, nerve-pulse 3s ease-in-out 2s infinite;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
```

**Verificación:**
- [ ] SVG visible detrás del headline sin afectar legibilidad
- [ ] Pulsa con 3s cycle
- [ ] No afecta Lighthouse (inline SVG, no imagen externa)
- [ ] prefers-reduced-motion → estático a 20% opacity
- [ ] Funciona en 375px sin overflow

---

### A-02: Cards P1 — feedback de selección

**Trigger:** click/tap en card
**Duración:** 150ms transición + 600ms delay antes de avanzar a P2

```css
/* Estado normal */
.p1-card {
  border: 1px solid rgba(255,255,255,0.08);
  background: transparent;
  transition: all 150ms var(--ease-out-quart);
}

/* Estado seleccionado */
.p1-card.selected {
  border-color: var(--color-accent);
  background: var(--color-accent-subtle);  /* accent al 10% */
}

/* Checkmark en esquina superior derecha */
.p1-card.selected::after {
  content: '✓';
  position: absolute;
  top: 12px; right: 12px;
  color: var(--color-accent);
  font-size: 16px;
  animation: fadeIn 200ms var(--ease-out-quart);
}
```

**Secuencia post-selección:**
```
0ms:    Card cambia a estado selected (150ms transition)
600ms:  Todas las cards hacen fade-out (300ms)
900ms:  Slide transition a P2 (400ms slide-left)
```

**Verificación:**
- [ ] Feedback visual inmediato al tap (< 150ms)
- [ ] Delay 600ms se siente como "registro" de la respuesta, no como lag
- [ ] Transición a P2 es slide horizontal, no corte seco

---

### A-03: Below the fold — scroll animations

**Cards de tensión (3 cards):**
```
Trigger: IntersectionObserver, threshold 0.2
Animación: fade-in-up con stagger
Delay entre cards: 150ms
Duración cada card: 500ms ease-out-expo
```

**Testimonios:**
```
Trigger: IntersectionObserver, threshold 0.3
Animación: fade-in con slide sutil desde izquierda (el borde verde guía)
Stagger: 200ms entre testimonios
```

**Dato colectivo ("142 personas esta semana"):**
```
Trigger: IntersectionObserver, threshold 0.5
Animación: counter animado de 0 → 142, duración 800ms
```

**CTA "Empezar mi diagnóstico":**
```
Al click: scroll suave a P1 (behavior: smooth) + pulse sutil en P1
Pulse: escala 1.0 → 1.02 → 1.0 en 400ms, una sola vez
```

**Verificación:**
- [ ] Las 3 cards de tensión aparecen escalonadas al scrollear
- [ ] El counter de "142 personas" se anima al entrar en viewport
- [ ] El CTA del below-fold sube suave a P1

---

## FASE 2 — P2-P4 + PRIMERA VERDAD + MICRO-ESPEJO 1

### A-04: Transición entre preguntas (P→P)

**Tipo:** Slide horizontal (la pregunta sale izquierda, la nueva entra derecha)
```
Duración: 400ms
Easing: ease-out-expo
La pregunta saliente: translateX(0) → translateX(-30px) + opacity 1→0
La pregunta entrante: translateX(30px) → translateX(0) + opacity 0→1
```

**Alternativa aceptable:** Cross-fade (fade out 200ms + fade in 200ms con 100ms overlap)

**NUNCA:** Corte seco. Bajo ninguna circunstancia.

---

### A-05: Primera verdad — revelación post-P1×P2

**Esta es la primera ruptura visual del gateway. Debe SENTIRSE como cambio de espacio.**

**Secuencia completa (timing total: 3.5-4s):**
```
T+0ms:     Opciones de P2 fade-out (300ms)
T+300ms:   Fondo transiciona ZONA 1 → ZONA 2 (600ms ease)
           El fondo oscurece. La persona SIENTE que entra en otro espacio.
T+900ms:   "Analizando tus respuestas..." aparece con TYPING EFFECT
           (velocidad: 40ms/carácter, cursor parpadeante)
T+2400ms:  Typing desaparece (fade-out 200ms)
T+2600ms:  Texto de la primera verdad aparece (fade-in 400ms)
           Tipografía: más grande que las preguntas, serif, con peso
T+3000ms:  Dato colectivo aparece debajo (fade-in 300ms)
           El número porcentual usa COUNTER ANIMADO (0→73%, 800ms)
T+3800ms:  Botón "Continuar" aparece (fade-in 300ms)
           PAUSA: la barra de progreso NO avanza durante la primera verdad
```

**Componente visual micro-espejo:**
```css
.micro-mirror {
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-secondary);
  padding: 24px;
  border-radius: 0 12px 12px 0;
}
```

**Verificación:**
- [ ] El cambio de fondo (ZONA 1→2) se SIENTE como entrar en otro espacio
- [ ] El typing effect genera anticipación real (no es instantáneo)
- [ ] El counter del dato colectivo se anima
- [ ] La barra de progreso se pausa durante la revelación
- [ ] En 375px: todo legible, sin overflow, sin scroll horizontal

---

### A-06: Micro-espejo 1 — post-P3×P4

**Secuencia (timing: 3-4s):**
```
T+0ms:     Opciones de P4 fade-out (300ms)
T+300ms:   Fondo transiciona ZONA 1 → ZONA 2 (600ms ease)
           Efecto opcional: slight scale (1.0→1.02→1.0) durante la transición
T+900ms:   Texto del micro-espejo slide-in desde izquierda (400ms ease-out-expo)
           Tipografía: más grande, más peso, más espacio entre líneas
           Borde izquierdo verde visible
T+1300ms:  Dato colectivo fade-in (300ms) + counter animado
T+2500ms:  Botón "Continuar" fade-in (300ms)
           PAUSA en barra de progreso
```

**Transición de SALIDA (micro-espejo → siguiente pregunta):**
```
T+0ms:     Click en continuar
T+0ms:     Micro-espejo fade-out (300ms)
T+300ms:   Fondo transiciona ZONA 2 → ZONA 1 (600ms ease)
           La persona "vuelve" a la exploración con nueva información
T+900ms:   Siguiente pregunta slide-in (400ms)
```

**Verificación:**
- [ ] La transición ZONA 1→2 se siente como ruptura (no solo cambio de color)
- [ ] El slide-in desde izquierda se percibe
- [ ] La vuelta a ZONA 1 se siente como "respiro" después de la reflexión
- [ ] prefers-reduced-motion: fade simple sin slide

---

## FASE 3 — P5-P8 + MICRO-ESPEJO 2

### A-07: P7 Sliders — feedback visual en tiempo real

**Cada slider tiene color dinámico según valor:**
```css
/* Valor ≤ 3: rojo */
.slider[data-level="low"] .slider-track-fill {
  background: var(--color-danger, #E53E3E);
}

/* Valor 4-6: amarillo/ámbar */
.slider[data-level="mid"] .slider-track-fill {
  background: var(--color-warning, #D69E2E);
}

/* Valor ≥ 7: verde */
.slider[data-level="high"] .slider-track-fill {
  background: var(--color-accent);
}

/* Transición de color al mover */
.slider-track-fill {
  transition: background-color 200ms ease, width 50ms linear;
}
```

**Requisitos táctiles:**
```
- Thumb: mínimo 44px × 44px touch target
- Track height: mínimo 8px (visual), 44px (touch area)
- Valor numérico visible encima del thumb
- Sin valor por defecto — thumb centrado pero gris/desactivado hasta primer toque
```

**Verificación:**
- [ ] El color cambia fluidamente al mover (no salta)
- [ ] Touch-friendly en 375px (dedo gordo puede usarlo sin frustración)
- [ ] Los 5 sliders se ven completos sin scroll horizontal
- [ ] Valor numérico legible en todo momento

---

### A-08: Micro-espejo 2 — post-P6

**Idéntica mecánica que Micro-espejo 1 (A-06) pero con mayor intensidad:**

```
Diferencias respecto a M1:
- El fondo puede ser ligeramente MÁS oscuro (ZONA 2 intensificada)
- La tipografía del texto principal puede ser 2px más grande
- El delay antes del botón continuar es 500ms más largo (3000ms vs 2500ms)
  → La persona necesita más tiempo para procesar P6 (la frase identitaria)
```

**Verificación:**
- [ ] Se siente como la versión "más profunda" del micro-espejo 1
- [ ] El texto habla el idioma del perfil detectado en P6
- [ ] La pausa antes del botón continuar es perceptiblemente más larga

---

## FASE 4 — BISAGRA + EMAIL

### A-09: Transición a bisagra — "Calculando tu perfil..."

**El momento de MAYOR TENSIÓN VISUAL del gateway.**

**Secuencia (timing: 2s de build + 3s de revelación):**
```
T+0ms:     P8 opciones fade-out (300ms)
T+300ms:   Fondo transiciona a ZONA 2 máxima oscuridad (600ms)
T+900ms:   "Calculando tu perfil de regulación..." con TYPING EFFECT
           Velocidad: 35ms/carácter (ligeramente más lento que primera verdad)
           Cursor parpadeante verde
T+2500ms:  Typing desaparece (fade-out 200ms)
```

---

### A-10: Score — counter animado con impacto

**Revelación del score (la pieza central de la bisagra):**
```
T+2700ms:  Score aparece: COUNTER ANIMADO de 0 → [valor]
           Duración: 1200ms
           Easing: ease-out-expo (rápido al principio, desacelera)
           Tamaño: 56px mínimo (Cormorant Garamond)
           Color: según escala semáforo
             0-39: var(--color-danger)
             40-59: var(--color-warning)  
             60-79: var(--color-caution, #ECC94B)
             80-100: var(--color-accent)

T+3900ms:  "de 100" aparece al lado (fade-in 300ms, color secondary)

T+4200ms:  PAUSA de 1 segundo — la persona procesa su número

T+5200ms:  Benchmark aparece debajo:
           "El promedio de personas que empezaron a regularse:"
           Counter animado: 0 → 72 (800ms)
           Color: var(--color-accent)

T+6000ms:  Texto de la brecha fade-in (400ms):
           "La distancia entre ambos números..."

T+6400ms:  Texto del coste fade-in (400ms):
           "Con un nivel de regulación de 34, tu cuerpo pierde..."

T+6800ms:  Dato colectivo social fade-in (300ms):
           "De las 5.247 personas..." con counter animado
```

**Layout visual de la bisagra:**
```css
.bisagra {
  background: linear-gradient(
    180deg,
    var(--color-bg-secondary) 0%,
    rgba(var(--color-accent-rgb), 0.03) 100%
  );
  border: 1px solid rgba(var(--color-accent-rgb), 0.15);
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
}
```

**Verificación:**
- [ ] El counter de 0→34 se SIENTE (no demasiado rápido, no demasiado lento)
- [ ] La pausa de 1s entre score propio y benchmark genera tensión
- [ ] Los dos números (propio vs benchmark) son visualmente comparables
- [ ] Todo el texto se revela secuencialmente, no de golpe
- [ ] Funciona en 375px con scroll vertical natural

---

### A-11: Email capture — mapa borroso de fondo

**El efecto que genera tensión: la persona CASI VE su resultado.**

```css
/* Las 5 barras de dimensión detrás del formulario */
.blurred-preview {
  filter: blur(8px);
  opacity: 0.3;
  pointer-events: none;
  position: absolute;
  z-index: 0;
}

/* Los colores semáforo son VISIBLES pero el contenido es ILEGIBLE */
/* Esto genera: "puedo ver que hay algo ahí, necesito mi email para verlo" */

/* El formulario de email por encima */
.email-form {
  position: relative;
  z-index: 1;
  background: rgba(var(--color-bg-primary-rgb), 0.9);
  backdrop-filter: blur(4px);
  border-radius: 16px;
  padding: 32px 24px;
}
```

**Input de email:**
```css
.email-input {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 100px;  /* pill shape */
  padding: 16px 24px;
  font-size: 16px;  /* previene zoom en iOS */
  color: var(--color-text-primary);
  transition: border-color 200ms ease;
}

.email-input:focus {
  border-color: var(--color-accent);
  outline: none;
  box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.15);
}

/* Validación en tiempo real */
.email-input.invalid {
  border-color: var(--color-danger);
}

.email-input.valid {
  border-color: var(--color-accent);
}
```

**Verificación:**
- [ ] Las barras borrosas de fondo se ven (colores distinguibles pero texto ilegible)
- [ ] El blur genera tensión real ("casi lo veo")
- [ ] El input no hace zoom en iOS (font-size ≥ 16px)
- [ ] Validación visual instantánea (sin esperar submit)
- [ ] En 375px: el formulario ocupa el ancho correcto sin overflow

---

## FASE 5 — MAPA VIVO + RESULTADO

### A-12: Momento WOW — revelación progresiva del mapa

**La pieza más elaborada de todo el sistema. 8 segundos coreografiados.**

```
Segundo 0:     Score global aparece centro de pantalla
               Counter animado: 0 → [valor], duración 1200ms
               Tamaño: 60-80px (Cormorant Garamond)
               Solo este número. Nada más.

Segundo 1.5:   PAUSA. Solo el score. La persona procesa.

Segundo 2.0:   D1 "Regulación Nerviosa" aparece:
               - Nombre fade-in (300ms)
               - Barra se llena de 0% → valor% (800ms ease-out-expo)
               - Color semáforo de la barra según score
               - Score numérico counter animado (400ms)

Segundo 3.0:   D2 "Calidad de Sueño" — misma animación
Segundo 4.0:   D3 "Claridad Cognitiva"
Segundo 5.0:   D4 "Equilibrio Emocional"
Segundo 6.0:   D5 "Alegría de Vivir"

Segundo 7.0:   La dimensión más baja se DESTACA:
               - Borde más grueso o glow sutil
               - Badge "Tu prioridad nº1" fade-in
               - Las otras dimensiones reducen opacidad ligeramente (0.7)

Segundo 8.0:   "Primer paso recomendado" card fade-in-up (500ms)
```

**Barras de dimensión:**
```css
.dimension-bar {
  height: 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  overflow: hidden;
}

.dimension-bar-fill {
  height: 100%;
  border-radius: 4px;
  width: 0%;
  transition: width 800ms var(--ease-out-expo);
}

/* Colores semáforo */
.dimension-bar-fill[data-score="low"]  { background: var(--color-danger); }
.dimension-bar-fill[data-score="mid"]  { background: var(--color-warning); }
.dimension-bar-fill[data-score="high"] { background: var(--color-accent); }
```

**Verificación:**
- [ ] La secuencia de 8 segundos genera WOW (probar con alguien externo)
- [ ] Cada dimensión aparece secuencialmente, NO todas de golpe
- [ ] La pausa de 1.5s después del score global genera anticipación
- [ ] La dimensión prioritaria se destaca visualmente sin ambigüedad
- [ ] En 375px: las barras son legibles, los números claros
- [ ] prefers-reduced-motion: todo aparece de golpe sin animaciones

---

### A-13: CTA "Semana 1" — calma después de la densidad

```css
/* Espacio generoso — el CTA respira */
.cta-section {
  padding: 64px 24px;
  text-align: center;
}

/* Botón pill verde, generoso */
.cta-button {
  background: var(--color-accent);
  color: var(--color-bg-primary);
  border: none;
  border-radius: 100px;
  padding: 18px 48px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
  box-shadow: 0 4px 14px rgba(var(--color-accent-rgb), 0.25);
  min-height: 52px;  /* touch target */
}

.cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(var(--color-accent-rgb), 0.35);
}

.cta-button:active {
  transform: translateY(0);
}
```

---

### A-14: Compartir — descarga PNG

**El botón "Descargar mi mapa" genera un PNG con:**
```
- Estética dark consistente con el mapa
- Score global + 5 dimensiones con barras y colores
- Sin datos personales visibles (solo scores)
- Resolución: 1080x1920 (stories) o 1200x630 (social)
- Usar html2canvas o similar para capturar el DOM
```

---

## LANDING — BELOW THE FOLD (IntersectionObserver)

### A-15: Scroll-triggered animations para todas las secciones

**Implementación:**
```javascript
// IntersectionObserver con threshold configurado por sección
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // Solo una vez
    }
  });
}, { threshold: 0.2 });

// Aplicar a todas las secciones del below-fold
document.querySelectorAll('.scroll-reveal').forEach(el => {
  observer.observe(el);
});
```

**CSS para elementos scroll-revealed:**
```css
.scroll-reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 600ms var(--ease-out-expo),
              transform 600ms var(--ease-out-expo);
}

.scroll-reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger para grupos */
.scroll-reveal.stagger:nth-child(1) { transition-delay: 0ms; }
.scroll-reveal.stagger:nth-child(2) { transition-delay: 150ms; }
.scroll-reveal.stagger:nth-child(3) { transition-delay: 300ms; }
```

**Verificación:**
- [ ] Sección "Espejo" anima al entrar en viewport
- [ ] 3 cards de tensión aparecen escalonadas (150ms entre cada una)
- [ ] Testimonios aparecen escalonados
- [ ] Sección "Alivio" anima al entrar
- [ ] Ninguna animación se repite al scrollear arriba y volver

---

## RESUMEN DE COMPONENTES REQUERIDOS

| ID | Componente | Fase | Tipo |
|----|-----------|------|------|
| A-01 | SVG sistema nervioso + pulso | 1 | SVG + CSS |
| A-02 | Cards P1 feedback selección | 1 | CSS transitions |
| A-03 | Below-fold scroll animations | 1 | IntersectionObserver |
| A-04 | Transición entre preguntas | 2-3 | CSS slide/fade |
| A-05 | Primera verdad (zona change + typing + counter) | 2 | JS + CSS |
| A-06 | Micro-espejo 1 (zona change + slide-in) | 2 | JS + CSS |
| A-07 | Sliders color dinámico | 3 | CSS + JS |
| A-08 | Micro-espejo 2 (intensificado) | 3 | JS + CSS |
| A-09 | "Calculando tu perfil..." typing | 4 | JS componente |
| A-10 | Score counter + revelación secuencial | 4 | JS + CSS |
| A-11 | Email capture + mapa borroso | 4 | CSS blur + form |
| A-12 | Momento WOW (8s secuenciados) | 5 | JS orquestado |
| A-13 | CTA con espacio generoso | 5 | CSS |
| A-14 | Descarga PNG | 5 | html2canvas |
| A-15 | Scroll-triggered below-fold | 1 | IntersectionObserver |

---

## CHECKLIST VISUAL POR FASE

### Fase 1
- [ ] A-01: SVG pulsa detrás del headline
- [ ] A-02: Cards P1 tienen feedback visual al seleccionar
- [ ] A-03: Below-fold secciones animan al scrollear
- [ ] A-15: IntersectionObserver implementado

### Fase 2
- [ ] A-04: Transiciones entre preguntas (slide/fade, NUNCA corte seco)
- [ ] A-05: Primera verdad con cambio de zona + typing + counter
- [ ] A-06: Micro-espejo 1 con cambio de zona + slide-in

### Fase 3
- [ ] A-04: Transiciones entre P5-P8
- [ ] A-07: Sliders con color dinámico en tiempo real
- [ ] A-08: Micro-espejo 2 intensificado

### Fase 4
- [ ] A-09: Typing effect "Calculando tu perfil..."
- [ ] A-10: Score counter + revelación secuencial completa
- [ ] A-11: Mapa borroso detrás del email capture

### Fase 5
- [ ] A-12: Momento WOW completo (8 segundos)
- [ ] A-13: CTA con espacio y calma
- [ ] A-14: Descarga PNG funcional

---

**Si alguna de estas checkboxes no está marcada, la fase NO está completa.**
