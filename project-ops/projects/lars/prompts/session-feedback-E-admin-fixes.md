## Contexto
Proyecto: L.A.R.S.©
Sesión Feedback-E: Admin Fixes — Correcciones en el panel de administración (copy editor UX, editor de respuestas del gateway, textos editables del mapa).

Esta sesión viene de un feedback del director del programa (Javier). Son correcciones de UX y funcionalidad del panel de administración.

## Documentos fundamentales (LEER ANTES de empezar)
- docs/VISION.md — Visión del producto.
- docs/PROFILES.md — Perfiles del cliente ideal.
- docs/DESIGN.md — Sistema de diseño. NADA se inventa fuera de este doc.

## Lo que ya está construido
- Admin v2 completo: Hub, LAM, Copy Editor, Analytics, Agenda, Automations
- Copy Editor con auto-save, preview en vivo, y override tracking
- Sistema de respuestas del gateway administrable
- Mapa vivo con FocusBanner, evoluciones, y AspiracionalTimeline

## Tu tarea

3 correcciones del admin.

### Fix 1: Copy Editor — Auto-refresh rompe la edición
**Problema:** Cuando Javier cambia un texto en el copy editor, la sección se refresca automáticamente a los pocos segundos. Esto hace difícil la edición porque pierde el foco y la posición.

**Solución requerida:**
1. **Eliminar el auto-save con debounce** (o hacerlo opt-in). El guardado actual con debounce de 1.5s provoca que el componente se re-renderice mientras el usuario está editando.
2. **Añadir un botón "Guardar"** explícito por sección o por campo. El usuario hace cambios y cuando está satisfecho, pulsa "Guardar".
3. **Después de guardar, mantener la sección abierta** y el scroll en la misma posición. Actualmente, después de guardar (o del auto-save), la vista vuelve a la primera sección del acordeón. El usuario debe quedarse EXACTAMENTE donde estaba.
4. **Feedback visual del guardado:** Al pulsar "Guardar", mostrar confirmación (ej: "Guardado ✓" durante 2 segundos) sin mover la vista.

**Implementación sugerida:**
- Mantener el estado "dirty" (modificado) por campo. Mostrar indicador de cambio pendiente.
- Botón "Guardar" aparece solo cuando hay cambios pendientes.
- Al guardar: llamada a la API, actualizar estado, mostrar confirmación, NO re-renderizar el acordeón ni mover scroll.
- Opcionalmente: botón "Guardar todos los cambios" si hay múltiples campos modificados.

### Fix 2: Editor de respuestas del gateway — Estructura inconsistente
**Problema:** En el admin, la sección para editar las respuestas del gateway (Primera Verdad, Micro-espejo 1, Micro-espejo 2, etc.) tiene una estructura de edición inconsistente:
- No todas las preguntas tienen la misma estructura de campos.
- Se repiten textos que no corresponden a la respuesta concreta que se está editando.
- El texto "Tu mente no se apaga ya que el estrés crónico..." se repite en varias respuestas cuando NO debería (solo debería estar en la que corresponde).
- Es confuso saber qué campo corresponde a qué parte de la experiencia.

**Solución requerida:**
1. **Auditar la estructura de datos** de las respuestas del gateway. Cada respuesta posible de cada pregunta debe tener UN solo set de textos asociados (micro-espejo, primera verdad, explicación).
2. **Estandarizar la interfaz de edición:** Cada respuesta debe mostrar exactamente:
   - El texto de la pregunta (como contexto, no editable en esta vista).
   - La opción de respuesta (como contexto).
   - Los campos editables asociados a ESA respuesta específica.
3. **Eliminar textos duplicados** que se muestran en respuestas donde no corresponden.
4. **Revisar también Micro-espejo 1 y Micro-espejo 2** — probablemente tienen el mismo problema de textos repetidos.

**IMPORTANTE:** Este fix puede requerir cambios en la estructura de datos del copy-defaults o de la lógica que mapea respuestas a textos. Si necesitas cambiar el esquema, AVISAME ANTES.

### Fix 3: Textos del "Mapa de neuroregulación" editables desde admin
**Problema:** Los textos de la sección "Tu Mapa de neuroregulación" (antes "Tu Mapa de Regulación") no son editables desde el admin. Javier necesita poder cambiar los textos de esta sección.

**Solución:**
1. Identificar TODOS los textos de la sección del mapa que deberían ser editables:
   - Títulos de secciones (FocusBanner, evoluciones, timeline)
   - Textos descriptivos
   - Labels y CTAs
   - Textos de cada evolución (día 0, día 3, día 7, día 14, día 21...)
2. Añadir estos textos al sistema de copy-defaults (en `src/lib/copy-defaults.ts` o equivalente) bajo un nuevo grupo "mapa" o ampliar el grupo existente.
3. Añadir la sección en la interfaz del copy editor del admin (nuevo tab o nueva sección dentro del tab "Mapa").
4. Integrar los componentes del mapa para leer overrides vía el sistema de copy existente (getCopy/useCopy).

---

Antes de escribir código:
1. Muéstrame el componente actual del CopyEditor y cómo funciona el auto-save.
2. Muéstrame la estructura actual del editor de respuestas del gateway.
3. Lista qué textos del mapa ya están en copy-defaults y cuáles no.
4. Espera mi aprobación.

## Reglas críticas
- NO modifiques la base de datos sin avisarme antes (especialmente el esquema de copy_overrides).
- TODO el diseño viene de docs/DESIGN.md. No inventes valores.
- El admin es la herramienta de Javier. Debe ser intuitivo sin documentación.
- NUNCA ejecutes `npm run build` — usa `npx tsc --noEmit`.
- Para desplegar: `git push`. Vercel hace el build.
- Recuerda: no soy desarrollador. Explícame todo en lenguaje simple.

## Validación obligatoria (ANTES de cada commit)

### 1. Tipos y compilación
- Ejecuta `npx tsc --noEmit` — cero errores, cero warnings.

### 2. Seguridad
- API routes del copy editor siguen protegidas con autenticación admin.

### 3. Testing funcional
- **Copy Editor:**
  - Abrir una sección, editar un campo → NO se refresca automáticamente.
  - Pulsar "Guardar" → texto se guarda, sección sigue abierta, scroll no se mueve.
  - Indicador "Guardado ✓" aparece brevemente.
  - Recargar página → el texto guardado persiste.
- **Editor de respuestas:**
  - Cada respuesta muestra SOLO sus textos asociados (sin duplicados).
  - Primera Verdad, Micro-espejo 1 y 2: estructura consistente.
  - Editar un texto → se guarda correctamente y se refleja en el gateway público.
- **Mapa editable:**
  - Los nuevos textos aparecen en el copy editor.
  - Editarlos cambia lo que se ve en el mapa público.
  - Sin override, el mapa se ve exactamente igual que antes (transparente).

### 4. Diseño y UX
- El botón "Guardar" se siente natural en el flujo de edición.
- La estructura de respuestas del gateway es clara y consistente.
- La nueva sección de mapa en el copy editor sigue el mismo patrón visual que las demás.

## Actualización de progreso
Después de completar:
1. Actualiza `docs/PROGRESS.md` con resumen de lo construido.
2. Commit final limpio con mensaje descriptivo.
