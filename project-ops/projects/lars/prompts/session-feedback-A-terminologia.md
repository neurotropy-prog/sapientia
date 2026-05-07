## Contexto
Proyecto: L.A.R.S.©
Sesión Feedback-A: Terminología Global + Textos por Defecto — Renombrar conceptos en todo el sistema, actualizar copy por defecto, y corregir errores de traducción.

Esta sesión viene de un feedback del director del programa (Javier). Son cambios de texto y terminología que afectan a TODA la aplicación: landing, gateway, mapa vivo, admin, y los defaults del copy editor.

## Documentos fundamentales (LEER ANTES de empezar)
Estos docs definen la visión, para quién construimos, por qué, y cómo:
- docs/VISION.md — Visión del producto: problema, solución, límites.
- docs/PROFILES.md — Perfiles PROFUNDOS del cliente ideal (7 capas + 10 fuerzas).
  Construye para ESTA persona concreta, no para un "usuario" genérico.
- docs/MOVEMENT.md — Mapa de movimiento completo del usuario en su journey.
- docs/GATEWAY.md — Puerta de entrada: experiencia de 3-5 min que transforma.
- docs/DESIGN.md — Sistema de diseño. NADA se inventa fuera de este doc.

## Lo que ya está construido
- Landing + Gateway + Mapa Vivo + Emails + Booking + Analytics (todo en producción)
- Admin v2 con Copy Editor, LAM, Hub, Agenda, Analytics Enhanced
- Sistema AMPLIFY de referidos
- Copy Editor con auto-save y preview en vivo

## Tu tarea

Esta sesión tiene 7 cambios de terminología y copy. Todos son de búsqueda y reemplazo masivo por toda la aplicación (frontend público, admin, defaults de copy, base de datos si aplica).

### Cambio 1: "Arquetipo del sistema nervioso" → "Mecanismo de defensa adaptativo"
Buscar y reemplazar TODAS las variantes en TODO el proyecto:
- "Arquetipos del sistema nervioso" → "Mecanismos de defensa adaptativo" (plural)
- "Arquetipo del sistema nervioso" → "Mecanismo de defensa adaptativo" (singular)
- "TU ARQUETIPO DEL SISTEMA NERVIOSO" → "MECANISMO DE DEFENSA ADAPTATIVO" (mayúsculas)
- "Tu arquetipo" → "Tu mecanismo de defensa" (forma corta si existe)
- "Arquetipo" → "Mecanismo de defensa adaptativo" (cuando se usa como concepto aislado)
- En el admin/panel de control: "Arquetipo" en labels, headers, columnas → "Mecanismo de defensa adaptativo"

**CUIDADO:** No reemplaces ciegamente. Revisa cada contexto. "Arquetipo" puede aparecer como nombre de variable, key de BD, etc. — esos NO se cambian. Solo cambia el texto visible al usuario y los defaults de copy.

Donde dice "Descubrir tu perfil completo" en el botón del mapa → cambiar a "Descubrir tu mecanismo de defensa completo". El label "NUEVO DESDE TU ÚLTIMA VISITA / TU ARQUETIPO DEL SISTEMA NERVIOSO" → "NUEVO DESDE TU ÚLTIMA VISITA / MECANISMO DE DEFENSA ADAPTATIVO".

### Cambio 2: "rumiación" / "rumiar" → "Obsesividad mental"
Buscar en todo el proyecto (copy defaults, textos del gateway, descripciones de perfiles, mapa, admin):
- "rumiación" → "obsesividad mental"
- "Rumiación" → "Obsesividad mental"
- "rumiar" → "obsesividad mental" (adaptar gramática según contexto)
- "La rumiación ES hiperactivación cognitiva" → "La obsesividad mental ES hiperactivación cognitiva"

### Cambio 3: "Tu Mapa de Regulación" → "Tu mapa de neuroregulación"
Buscar y reemplazar en todo el proyecto:
- "Tu Mapa de Regulación" → "Tu mapa de neuroregulación"
- "Mapa de Regulación" → "Mapa de neuroregulación"
- "mapa de regulación" → "mapa de neuroregulación"
Revisar titles, headings, meta tags, breadcrumbs, sidebar links, emails.

### Cambio 4: Actualizar textos por defecto del copy (evitar flash en reload)
En `src/lib/copy-defaults.ts` (o donde estén centralizados los defaults del copy editor), los textos por defecto deben coincidir con los textos que Javier ya ha editado vía el copy editor. Actualmente, al hacer reload de la página se ve por un instante el texto original antes de cargar el override de Supabase.

**Solución:** Los textos actuales editados en Supabase (tabla `copy_overrides`) se convierten en los NUEVOS defaults hardcodeados en `copy-defaults.ts`. Así el texto inicial ya es el correcto y no hay flash.

Para implementar esto:
1. Consulta la tabla `copy_overrides` y lista todos los overrides actuales.
2. Para cada override, actualiza el valor en `copy-defaults.ts`.
3. Opcionalmente, limpia los overrides de Supabase que ahora coinciden con el default.
4. Verifica que al recargar la página NO haya flash de texto diferente.

### Cambio 5: Corregir error "gateway.p5.optionC" y "gateway.p5.optionD"
En la pregunta 5 del gateway ("¿Cuándo fue la última vez que disfrutaste algo de verdad..."), las opciones C y D muestran la key de traducción cruda ("gateway.p5.optionC") en vez del texto real. Localiza dónde están definidas estas opciones y asegúrate de que todas tienen su texto asignado correctamente. Probablemente falta el mapping en el archivo de datos del gateway o en copy-defaults.

### Cambio 6: Cambios de copy en sección de preguntas del gateway
En la sección de la pregunta "¿Cuál de estas frases podrías haber dicho tú esta semana?" (la pregunta de síntomas del gateway):

**Cambiar el título de la pregunta:**
- DE: "¿Cuál de estas frases podrías haber dicho tú esta semana?"
- A: "¿Qué síntomas estás expresando de forma cotidiana?"

**Cambiar los textos contextuales entre preguntas:**
- DE: "La reactividad emocional no es un defecto de carácter. Es la respuesta de un cerebro que ha agotado los recursos para regular."
- A: "Estos son los síntomas más comunes de las personas que han agotado sus recursos bioquímicos y emocionales para lidiar con la altísima demanda que requiere la vida actual."

- DE: "Esta es la pregunta que más tarda en responderse. Tómate tu tiempo."
- A: "Responde con sinceridad y sin culpa. Estás aquí porque eres consciente y buscas mejorar que es más de lo que la inmensa mayoría hace."

**Además:** En esta sección, el usuario debe poder seleccionar MÁS DE UNA respuesta (multi-select), igual que funciona en la pregunta "¿Reconoces alguna de estas señales en tu día a día?". Si actualmente es single-select, convertirla a multi-select.

### Cambio 7: Sección "Tu nivel de regulación" — Añadir contexto
En la pantalla de resultados, la sección que muestra el score (ej: "38 de 100 — Moderado") y el número comparativo ("72") no queda clara. Hay que reestructurar así:

**TU NIVEL DE REGULACIÓN**
**38** de 100 — Moderado

**Personas que empezaron en este rango:**
El **69%** de las personas mejoraron un 12-18% sus niveles en las primeras 72 h. del programa e incrementaron > 35% sus resultados al completar el proceso de neuroregulación.

Las que actuaron en la primera semana avanzaron un 34% más rápido que las que esperaron un mes.

Busca este bloque en el componente de resultados y asegúrate de que el texto quede exactamente así (incluyendo el bold en "69%").

---

Antes de escribir código:
1. Dime qué archivos encontraste con cada término a reemplazar (un resumen, no cada línea).
2. Dime tu plan para el cambio 4 (actualizar defaults desde copy_overrides).
3. Espera mi aprobación.

## Reglas críticas
- NO modifiques la base de datos sin avisarme antes.
- TODO el diseño viene de docs/DESIGN.md. No inventes valores.
- Recuerda: no soy desarrollador. Explícame todo en lenguaje simple.
- NUNCA ejecutes `npm run build` — usa `npx tsc --noEmit` para verificar tipos.
- Para desplegar: `git push`. Vercel hace el build.

## Validación obligatoria (ANTES de cada commit)

IMPORTANTE: No hagas commit de nada sin completar TODAS estas verificaciones.

### 1. Tipos y compilación
- Ejecuta `npx tsc --noEmit` — cero errores, cero warnings.

### 2. Seguridad
- Cero secrets/API keys/tokens hardcodeados — todo en .env.local.

### 3. Calidad del código
- Cero console.log de debug, código comentado, o TODOs sin resolver.
- Nombres descriptivos en inglés.

### 4. Testing funcional
- Verificar que TODAS las páginas donde cambiaste texto siguen funcionando:
  - Landing completa: hero, mirror, tension, social proof, relief, footer.
  - Gateway: todas las preguntas P1-P8, primera verdad, micro-espejos.
  - Resultados: score, perfil, mapa borroso.
  - Mapa vivo: FocusBanner, evoluciones, timeline.
  - Admin: copy editor, hub, LAM, analytics.
- Verificar que NO hay flash de texto por defecto al recargar (cambio 4).
- Verificar que la opción C y D de P5 muestran texto real (cambio 5).
- Verificar que la pregunta de síntomas permite multi-select (cambio 6).

### 5. Diseño y UX
- Verificar que los nuevos textos no rompen layouts (textos más largos que los originales).
- "Mecanismo de defensa adaptativo" es más largo que "Arquetipo" — verificar que cabe en cards, badges, headers, mobile.

## Actualización de progreso
Después de completar:
1. Actualiza `docs/PROGRESS.md` con resumen de lo construido.
2. Commit final limpio con mensaje descriptivo.
