## Contexto
Proyecto: L.A.R.S.©
Sesión Feedback-C: Gateway UX Fixes — Correcciones de experiencia en el gateway (navegación, sliders, preload, gradientes).

Esta sesión viene de un feedback del director del programa (Javier). Son correcciones de UX y diseño en el flujo del gateway.

## Documentos fundamentales (LEER ANTES de empezar)
- docs/VISION.md — Visión del producto.
- docs/PROFILES.md — Perfiles del cliente ideal.
- docs/MOVEMENT.md — Mapa de movimiento del usuario.
- docs/GATEWAY.md — Puerta de entrada: experiencia de 3-5 min que transforma.
- docs/DESIGN.md — Sistema de diseño. NADA se inventa fuera de este doc.
- docs/ANIMATIONS.md — Specs técnicas de animaciones (A-01 a A-15).

## Lo que ya está construido
- Landing + Gateway completo (P1-P8, primera verdad, micro-espejos, bisagra, email, resultados)
- Sistema de scoring y perfiles
- Mapa vivo con evoluciones
- Admin con copy editor y gestión de respuestas

## Tu tarea

3 correcciones de UX en el gateway.

### Fix 1: Botón "Volver" no funciona correctamente
Cuando el usuario hace clic en "Volver" durante el test (después de haber respondido alguna pregunta), NO regresa a la pregunta anterior. Debe:
1. Volver a la pregunta inmediatamente anterior manteniendo la respuesta ya seleccionada.
2. Si el usuario está en P3, al dar "Volver" debe ir a P2 con su respuesta previa visible.
3. La transición debe ser suave (misma animación que al avanzar pero en reversa).
4. Si está en P1 (primera pregunta), el botón "Volver" no debe aparecer o debe llevar al hero.

Revisa el componente del gateway que maneja la navegación entre preguntas. Probablemente es un estado de step/index que no se decrementa correctamente o que pierde el estado de las respuestas.

### Fix 2: Sliders — Marcas de escala (tick marks)
En la pregunta "En una escala del 1 al 10, ¿cómo calificarías cada una de estas áreas?" (la pregunta de sliders/barras), añadir:
- Pequeñas rayas verticales en **gris claro** que dividen cada barra/slider en **10 unidades** (como una regla).
- La raya central (posición 5) debe ser **un poquito más larga** que las demás para ser fácilmente identificable.
- Las rayas son sutiles (no deben competir con el slider activo). Color sugerido: usar el color de border o un gris sutil de DESIGN.md.

Esto es puramente visual — no cambia la lógica del slider. Es para que el usuario tenga referencia visual de las unidades.

### Fix 3: Pantalla de preload "Calculando tu perfil de regulación..."
La pantalla de carga que aparece mientras se calculan los resultados tiene problemas:

1. **Eliminar el rectángulo con objeto desenfocado/borroso** del fondo. Actualmente hay un rectángulo redondeado con un elemento difuminado dentro que parece un error de diseño. Eliminar ese rectángulo completo.
2. **Eliminar TODOS los degradados** (gradients) de esta pantalla y de toda la zona de resultados. Javier no quiere degradados en ninguna parte del diseño. Buscar en CSS: `linear-gradient`, `radial-gradient`, `gradient` — si son decorativos, eliminarlos.
3. **Rediseñar como un preload limpio** usando colores de docs/DESIGN.md:
   - Fondo: color de fondo principal del sistema de diseño (#0B0F0E o la superficie correspondiente).
   - Texto "Calculando tu perfil de regulación..." centrado, tipografía de DESIGN.md.
   - Un indicador de carga sutil: puede ser un pulso suave, una barra de progreso fina, o el SVG del pulso cardíaco (A-01 de ANIMATIONS.md) si ya existe.
   - Sin blur, sin degradados, sin objetos de fondo decorativos.

4. **Revisar TODA la zona de resultados** (no solo el preload) y eliminar CUALQUIER degradado que encuentres. El director fue claro: "No quiero degradados en el diseño en ningún sitio." Esto incluye:
   - La sección "Tu nivel de regulación" — sin degradados.
   - Las barras de las dimensiones — sin degradados.
   - Los fondos de cualquier card de resultados — sin degradados.
   - Si hay degradados en otras partes del gateway, eliminarlos también.

---

Antes de escribir código:
1. Muéstrame dónde está la lógica de navegación del gateway (el "Volver").
2. Identifica qué componente renderiza los sliders.
3. Identifica la pantalla de preload y lista todos los elementos con gradient/blur.
4. Espera mi aprobación.

## Reglas críticas
- NO modifiques la base de datos sin avisarme antes.
- TODO el diseño viene de docs/DESIGN.md. No inventes valores.
- CERO degradados (gradients) en el diseño. Colores sólidos siempre.
- NUNCA ejecutes `npm run build` — usa `npx tsc --noEmit` para verificar tipos.
- Para desplegar: `git push`. Vercel hace el build.
- Recuerda: no soy desarrollador. Explícame todo en lenguaje simple.

## Validación obligatoria (ANTES de cada commit)

### 1. Tipos y compilación
- Ejecuta `npx tsc --noEmit` — cero errores, cero warnings.

### 2. Testing funcional
- Verificar el botón "Volver":
  - Desde P2 → vuelve a P1 con respuesta previa.
  - Desde P5 → vuelve a P4 con respuesta previa.
  - Desde P8 → vuelve a P7 con respuesta previa.
  - Transición suave, sin saltos.
- Verificar sliders:
  - 10 tick marks visibles por barra.
  - Tick central (5) ligeramente más largo.
  - Visible en móvil sin saturar.
- Verificar preload:
  - Sin rectángulo borroso.
  - Sin degradados.
  - Texto legible, indicador de carga visible.
- Verificar resultados:
  - CERO degradados en toda la zona de resultados.

### 3. Diseño y UX
- Mobile-first: todo en 375px funciona perfectamente.
- Sin degradados en ningún sitio.
- Preload limpio y coherente con el sistema de diseño.
- Sliders con tick marks sutiles pero visibles.

## Actualización de progreso
Después de completar:
1. Actualiza `docs/PROGRESS.md` con resumen de lo construido.
2. Commit final limpio con mensaje descriptivo.
