## Contexto
Proyecto: L.A.R.S.©
Sesión Feedback-B: Landing Visual Fixes — Correcciones visuales en la landing page (logo, footer, testimonios, colores, ornamentos).

Esta sesión viene de un feedback del director del programa (Javier). Son correcciones puramente visuales de la landing page.

## Documentos fundamentales (LEER ANTES de empezar)
- docs/VISION.md — Visión del producto.
- docs/PROFILES.md — Perfiles del cliente ideal.
- docs/MOVEMENT.md — Mapa de movimiento del usuario.
- docs/GATEWAY.md — Puerta de entrada.
- docs/DESIGN.md — Sistema de diseño. NADA se inventa fuera de este doc.

## Lo que ya está construido
- Landing + Gateway + Mapa Vivo + Emails + Booking + Analytics (todo en producción)
- Admin v2 completo
- Sistema AMPLIFY

## Tu tarea

8 correcciones visuales en la landing page. Todas son CSS/markup, sin lógica nueva.

### Fix 1: Logo con transparencia
El logo del Instituto Epigenético aparece "aclarado" o con transparencia al inicio de la carga. Correcciones:
- Eliminar cualquier efecto de transparencia, opacity, o fade-in del logo.
- El color del logo debe ser **#cd796c** (sólido, sin transparencia).
- Debe verse nítido y con su color correcto desde el primer render.

### Fix 2: Footer — Links legales
Añadir al footer los siguientes links:
- Aviso legal → https://institutoepigenetico.com/aviso-legal
- Términos y condiciones → https://institutoepigenetico.com/terminos-y-condiciones
- Política de privacidad y cookies → https://institutoepigenetico.com/politica-de-privacidad
- Contacto → https://institutoepigenetico.com/contacto
- "2026 © Instituto Epigenético™" como texto de copyright

Formato: links en una línea separados por "|", con el copyright debajo. Tipografía pequeña, color discreto sobre el fondo oscuro. Seguir docs/DESIGN.md para sizing y color.

### Fix 3: Eliminar ornamentos de fondo decorativos
En la landing hay elementos decorativos de fondo (círculos grandes con gradiente/blur) que aparecen detrás de ciertas secciones (visibles en la zona del doctor y las credenciales, y en la zona de testimonios). **Elimínalos por completo.** Son los elementos marcados con "X" en el feedback visual.

Busca en los componentes de la landing: elementos con `blur`, `radial-gradient`, círculos decorativos posicionados con `absolute`, formas SVG puramente decorativas. Elimínalos. El fondo debe ser limpio.

### Fix 4: Testimonios — Color de fondo de las cards
Las cards de testimonios ("Experiencias reales") tienen un fondo que NO es de la paleta. Cambiar:
- El color de fondo de las cards de testimonios a **#fbf8f4** (beige cálido de la paleta).
- **NO usar #f1e9f5** (morado) ni ningún otro color fuera de docs/DESIGN.md.
- Eliminar cualquier numeración (1, 2, 3) que aparezca sobre las cards.

### Fix 5: Testimonios — Eliminar esfera/icono de comillas
Arriba de cada card de testimonio hay un icono de esfera con comillas (""). **Elimínalo.**

La card de testimonio debe quedar así (maqueta de referencia):
```
┌─────────────────────────────┐
│                             │
│  "No le conté a nadie que   │
│  lo hice. Los datos me      │
│  explicaron lo que yo no    │
│  quería ver."               │
│                             │
│  ┌──────────┐               │
│  │ CEO, 52  │               │
│  └──────────┘               │
│                             │
└─────────────────────────────┘
```
- Fondo: #fbf8f4
- Texto del testimonio en itálica o normal según DESIGN.md
- Badge con cargo y edad en la esquina inferior

### Fix 6: Testimonios — Añadir nombre con inicial de apellido
Después del texto de cada testimonio, añadir el nombre y la primera letra del apellido. Ejemplo:

"No le conté a nadie que lo hice. Los datos me explicaron lo que yo no quería ver." **Javier M.**

- El nombre va en **bold** después de la cita.
- Formato: "Nombre I." (nombre + primera letra del apellido + punto)
- Los nombres son datos ficticios por ahora. Usa nombres realistas españoles.

### Fix 7: Módulo estadísticas "73%" — Color de fondo
El módulo que muestra "73% de ejecutivos con burnout no lo saben" tiene un fondo rojizo/rosado. Cambiar a:
- Color de fondo: **#2d4134** (verde oscuro de la paleta).
- Texto: blanco.
- Verificar que el texto es legible sobre ese fondo.

### Fix 8: Botón "Seguir con mi evaluación" — Estilo
El botón "Seguir con mi evaluación →" que aparece después de "Lo que revelan tus respuestas":
- Texto: **blanco**
- Fondo: **#2d4134**
- Verificar que tiene hover state y se siente como un botón clicable.

---

Antes de escribir código:
1. Dime en qué componentes encontraste cada elemento a corregir.
2. Muéstrame tu plan de cambios archivo por archivo.
3. Espera mi aprobación.

## Reglas críticas
- NO modifiques la base de datos sin avisarme antes.
- TODO el diseño viene de docs/DESIGN.md. No inventes valores.
- Colores permitidos: los de DESIGN.md + los específicos de este feedback (#cd796c, #fbf8f4, #2d4134).
- NUNCA ejecutes `npm run build` — usa `npx tsc --noEmit` para verificar tipos.
- Para desplegar: `git push`. Vercel hace el build.
- Recuerda: no soy desarrollador. Explícame todo en lenguaje simple.

## Validación obligatoria (ANTES de cada commit)

### 1. Tipos y compilación
- Ejecuta `npx tsc --noEmit` — cero errores, cero warnings.

### 2. Calidad del código
- Cero console.log de debug, código comentado, o TODOs sin resolver.

### 3. Testing funcional
- Verificar visualmente TODA la landing en móvil (375px) y desktop:
  - Logo nítido sin transparencia en color #cd796c.
  - Footer con los 4 links + copyright.
  - Sin ornamentos decorativos de fondo.
  - Cards de testimonios con fondo #fbf8f4, sin icono de comillas, con nombre en bold.
  - Módulo 73% con fondo #2d4134 y texto blanco.
  - Botón "Seguir con mi evaluación" con fondo #2d4134 y texto blanco.

### 4. Diseño y UX
- Mobile-first: todo funciona perfectamente en 375px.
- Sin colores fuera de la paleta.
- Sin ornamentos decorativos.
- Testimonios limpios y legibles.

## Actualización de progreso
Después de completar:
1. Actualiza `docs/PROGRESS.md` con resumen de lo construido.
2. Commit final limpio con mensaje descriptivo.
