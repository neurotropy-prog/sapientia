## Contexto
Proyecto: L.A.R.S.©
Sesión Feedback-F: Mapa Vivo — Programa Completo + Contenido Semana 1 + Sesión Javier + Extracto Libro — Añadir toda la información del programa de 12 semanas al mapa, contenido de la Semana 1, disponibilidad inmediata de la sesión con Javier, y descarga del extracto del libro.

Esta sesión viene de un feedback del director del programa (Javier). El mapa de neuroregulación necesita mostrar el programa completo y tener más elementos de conversión inmediata.

## Documentos fundamentales (LEER ANTES de empezar)
- docs/VISION.md — Visión del producto. El programa L.A.R.S.© de 12 semanas.
- docs/PROFILES.md — Perfiles del cliente ideal. Los 4 perfiles.
- docs/MOVEMENT.md — Mapa de movimiento. Esto está en el punto Confidence → Readiness.
- docs/GATEWAY.md — Puerta de entrada.
- docs/DESIGN.md — Sistema de diseño. NADA se inventa fuera de este doc.

## Lo que ya está construido
- Mapa vivo con FocusBanner, evoluciones, AspiracionalTimeline
- Booking system para sesiones con Javier
- Emails de nurturing (8 emails)
- Sistema de pagos con Stripe

## Tu tarea

4 cambios en el mapa vivo / experiencia post-resultados.

### Cambio 1: Programa completo semana a semana en el mapa
En la sección "Tu mapa de neuroregulación" (antes "Tu mapa de regulación"), debe haber información del programa ENTERO semana a semana. Actualmente falta.

**Estructura del programa L.A.R.S.© (12 semanas, 3 fases):**

**FASE 1: EL DESPERTAR** (Semanas 1-4)
_Tu biología se empieza a normalizar._

- **SEMANA 1 — RECONOCER:** El burnout como exilio y mensajero
- **SEMANA 2 — ESTABILIZAR:** Regulación, sueño y las primeras partes
- **SEMANA 3 — NUTRIR:** Bioquímica, detox y los patrones que ignoran al cuerpo
- **SEMANA 4 — ACTIVAR:** Las cuatro funciones comprometidas y la neuroplasticidad

→ Al final de la Fase 1: _Duermes mejor, tienes más claridad, más energía, y tu cuerpo empieza a responder. Tienes un mapa completo de tus patrones de burnout, entiendes qué funciones cerebrales necesitan reparación y métricas objetivas de tu punto de partida._
_Sueño +15-30%. Energía matutina restaurada. Métricas base completas._

**FASE 2: LA METAMORFOSIS** (Semanas 5-8)
_Tu cabeza se reorganiza y lo que estaba congelado se procesa._

- **SEMANA 5 — NARRATIVAS:** La Madre Sobreprotectora, las creencias limitantes y la defusión
- **SEMANA 6 — ASAMBLEA INTERIOR:** Sombra, partes, protectores y exiliados
- **SEMANA 7 — PROCESAR:** Duelos, irrupciones emocionales y las bestias internas
- **SEMANA 8 — INTEGRAR:** Ventana de tolerancia, ACT, autocompasión y cierre

→ Al final de la Fase 2: _Has desmontado los patrones mentales que te trajeron al burnout, has procesado las emociones congeladas y tienes una relación radicalmente diferente con tus pensamientos, tus partes internas y tus miedos._
_MBI baja 20-30%. Niebla mental reducida. Capacidad de decisión restaurada._

**FASE 3: EL LÍDER FÉNIX** (Semanas 9-12)
_Tus relaciones se reparan y construyes una nueva arquitectura vital._

- **SEMANA 9 — CONECTAR:** Relaciones, corregulación, límites y reparación
- **SEMANA 10 — VALORES:** Brújula, acción comprometida y laboratorio de valentía
- **SEMANA 11 — RECONCILIACIÓN:** Liberación, nueva narrativa e identidad
- **SEMANA 12 — RECONSTRUIR:** La nueva arquitectura y el regreso a casa

→ Al final de la Fase 3: _Tienes una arquitectura vital sostenible, sistemas de alertas tempranas, relaciones reparadas y la capacidad de liderar tu vida sin que el precio sea tu salud. El burnout se convierte en tu maestro, no en tu carcelero._
_Rendimiento sostenible. Claridad restaurada. Confianza real._

**Implementación:**
- Diseñar como un acordeón con las 3 fases expandibles (similar al diseño actual de la landing que ya muestra las fases).
- Cada fase muestra sus 4 semanas con nombre y descripción corta.
- Los resultados al final de cada fase en texto más destacado (itálica o color acento sutil).
- Seguir el sistema de diseño: fondo oscuro, tipografía de DESIGN.md.
- **Estos textos deben ser editables desde el admin** (añadir al sistema de copy-defaults).

### Cambio 2: Contenido detallado de la Semana 1
Añadir una sección (dentro de la Semana 1 expandida o como sección separada) con lo que incluye la primera semana:

**Presentaciones del Dr. Carlos Alvear L.:**
1. Psiconeurobiología y epigenética del burnout (15 min.)
2. Los siete patrones que llevan al burnout (15 min.) + Las métricas y los hitos de la regulación (15 min.)
3. El potencial de crecimiento como líder y como individuo (15 min.)

**Qué vas a aprender:**
Neurociencia real de tu colapso · Cartografía corporal del agotamiento · Los 7 patrones de burnout profesional · Métricas base: MBI e indicadores biológicos · Primera práctica de regulación vagal

**Protocolo de Sueño de Emergencia** — Diseñado por el Dr. Carlos Alvear.
Un plan concreto para ganar hasta una hora más de sueño al día. Resultados en 72 horas.

**Mapa de Niveles de Neurotransmisores (MNN©)**
Tu primer análisis bioquímico real: qué sustancias produce tu cerebro, cuáles le faltan y qué significa eso para tu sueño, tu energía y tu claridad mental. Si no notas mejora en tu sueño, devolución íntegra. Sin preguntas. Sin formularios.

**Sesión 1:1 con Javier A. Martín Ramos**
Director del programa. Ya tiene tu mapa — la sesión arranca desde tus datos, no desde cero.

### Cambio 3: Sesión con Javier — Disponible inmediatamente
**Problema:** La sesión con Javier requiere que el usuario haga una reserva y espere. Cuando alguien está "caliente" (acaba de terminar el test y está en estado de Confidence), hacerle esperar para reservar una sesión es perder el momento.

**Solución:**
- La sesión con Javier debe estar **disponible desde el final del test** (resultados del gateway).
- NO es un booking que requiera esperar días. Lo que puede haber es un **recordatorio** o una **recomendación** de reservar.
- En la práctica: después de los resultados del gateway (o en el mapa cuando se desbloquea), mostrar un CTA tipo "Reserva tu sesión con Javier — ya tiene tu mapa" que lleve directamente al sistema de booking existente.
- Si es posible, pre-rellenar el contexto del booking con el perfil y score del usuario.

### Cambio 4: Extracto del libro — Descarga PDF
Añadir una sección en el mapa (o tras los resultados) con la posibilidad de descargar un extracto del libro:
- El extracto consiste en la **introducción y el capítulo 1** en PDF.
- Debe haber una CTA de descarga con texto tipo "Descarga el primer capítulo" o similar.
- **El PDF concreto y el extracto deben poder administrarse desde el admin.** Es decir:
  - En el admin, una sección donde Javier pueda subir el PDF.
  - Y editar el texto de la CTA de descarga.
- Si no se ha subido PDF, esta sección no se muestra.

---

Antes de escribir código:
1. Muéstrame cómo está estructurado actualmente el mapa vivo y dónde encajaría la sección del programa.
2. Dime dónde se muestra actualmente el booking de Javier y cómo integrar el CTA en resultados.
3. Plan para la subida de PDF al admin (storage en Supabase u otra solución).
4. Espera mi aprobación.

## Reglas críticas
- NO modifiques la base de datos sin avisarme antes.
- TODO el diseño viene de docs/DESIGN.md. No inventes valores.
- El programa semana a semana es contenido sensible — usa EXACTAMENTE los textos que te proporciono arriba.
- Los textos del programa deben ser editables desde admin.
- NUNCA ejecutes `npm run build` — usa `npx tsc --noEmit`.
- Para desplegar: `git push`. Vercel hace el build.
- Recuerda: no soy desarrollador. Explícame todo en lenguaje simple.

## Validación obligatoria (ANTES de cada commit)

### 1. Tipos y compilación
- Ejecuta `npx tsc --noEmit` — cero errores, cero warnings.

### 2. Seguridad
- El PDF se almacena en un lugar seguro (Supabase Storage con políticas).
- La API de subida de PDF requiere autenticación admin.

### 3. Testing funcional
- Programa de 12 semanas visible en el mapa con las 3 fases expandibles.
- Semana 1 muestra todo el contenido detallado.
- CTA de sesión con Javier aparece en resultados del gateway.
- Descarga de PDF funciona cuando hay PDF subido.
- Sin PDF subido, la sección de descarga no aparece.
- Todos los textos del programa son editables desde admin.

### 4. Diseño y UX
- Mobile-first 375px.
- Las 3 fases del programa son visuales y expandibles.
- Los resultados de cada fase destacan visualmente.
- CTA de sesión con Javier no es intrusivo pero es visible.
- Descarga de PDF se siente premium (no un link genérico).

## Actualización de progreso
Después de completar:
1. Actualiza `docs/PROGRESS.md` con resumen de lo construido.
2. Commit final limpio con mensaje descriptivo.
