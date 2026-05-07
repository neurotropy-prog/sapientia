## Contexto
Proyecto: L.A.R.S.©
Sesión Feedback-D: Resultados del Gateway — Perfil + WOW — Los resultados deben mostrar el "Mecanismo de defensa adaptativo" como pieza central para enganchar al usuario, y el botón "Descubrir tu perfil completo" debe funcionar.

Esta sesión viene de un feedback del director del programa (Javier). El problema: los resultados del gateway solo muestran valores/números, pero no enganchan emocionalmente. El director quiere que el "Mecanismo de defensa adaptativo" (antes "Arquetipo") sea la pieza WOW que enganche al cliente con su perfil.

## Documentos fundamentales (LEER ANTES de empezar)
- docs/VISION.md — Visión del producto.
- docs/PROFILES.md — Perfiles del cliente ideal. Los 4 perfiles (PC, FI, CE, CP).
- docs/MOVEMENT.md — Mapa de movimiento. **Los resultados son el punto Clarity → Confidence.**
- docs/GATEWAY.md — Puerta de entrada. Sección de resultados y mecánica de revelación.
- docs/DESIGN.md — Sistema de diseño. NADA se inventa fuera de este doc.
- docs/features/FEATURE_GATEWAY_DESIGN.md — Diseño detallado del gateway con scoring.

## Lo que ya está construido
- Gateway completo con 8 preguntas, scoring, perfil detectado
- Resultados con score de regulación, dimensiones, mapa borroso
- Mapa vivo con FocusBanner, sección de "Mecanismo de defensa" (antes "Arquetipo")
- Botón "Descubrir tu perfil completo" en el mapa (actualmente NO funciona)

## Tu tarea

3 cambios en la experiencia de resultados del gateway y mapa.

### Cambio 1: Mostrar el "Mecanismo de defensa adaptativo" en los resultados del gateway
**Contexto del director:** "Los resultados muestran solo los valores. Quiero que muestre también el Mecanismo de defensa adaptativo. El resultado si esto no tiene un efecto WOW, dependemos de que vea el email o haya un seguimiento. Quiero enganchar al cliente con el perfil."

Actualmente los resultados del gateway muestran:
- Score de regulación (ej: 38/100)
- Las 5 dimensiones con sus valores
- Mapa borroso + CTA email

**Lo que hay que AÑADIR** después del score y ANTES del mapa borroso:

Una sección de "Tu mecanismo de defensa adaptativo" que muestre:
- El nombre del mecanismo detectado (ej: "El Obsesivo", "El Controlador", etc.)
- Una descripción breve pero impactante de ese mecanismo (2-3 líneas que le hagan decir "esto soy yo").
- Por qué su sistema nervioso adoptó este mecanismo (1-2 líneas de contexto neurocientífico).

**Esta sección debe tener efecto WOW.** Es el momento donde la persona se ve reflejada. Usa el sistema de revelación del gateway (aparición progresiva, no todo de golpe). El texto del mecanismo ya debería existir en la lógica de perfiles — busca en los datos de perfiles/arquetipos.

**IMPORTANTE:** Esta información ya existe en el sistema (en los datos de perfiles del gateway). No hay que inventar contenido nuevo — hay que MOSTRARLO en los resultados en vez de guardárselo solo para el mapa.

### Cambio 2: Fix "Descubrir tu perfil completo" → Que funcione
El botón "Descubrir tu perfil completo" en el mapa vivo (la card que dice "NUEVO DESDE TU ÚLTIMA VISITA / MECANISMO DE DEFENSA ADAPTATIVO / El Obsesivo / [descripción] / Descubrir tu mecanismo de defensa completo →") actualmente **no hace nada al hacer clic.**

Corregir:
1. Identificar qué acción debería ejecutar ese botón.
2. Si debería expandir el contenido para mostrar el perfil completo → implementar la expansión con animación.
3. Si debería navegar a otra sección → implementar el scroll/navegación.
4. El contenido expandido debe mostrar el perfil completo del mecanismo de defensa: descripción detallada, cómo se manifiesta, y qué patrones genera.

**Nota:** Ahora el label debe decir "Descubrir tu mecanismo de defensa completo" (ya no "perfil completo"), y el header dice "MECANISMO DE DEFENSA ADAPTATIVO" (no "TU ARQUETIPO DEL SISTEMA NERVIOSO"). Si la sesión A de terminología aún no se ha ejecutado, haz estos cambios de texto aquí también.

### Cambio 3: Sección "Tu nivel de regulación" — Reestructurar contenido
La sección de resultados que muestra el score y la comparación con otras personas no queda clara. Reestructurar así:

**Bloque 1: Tu score**
```
TU NIVEL DE REGULACIÓN
38 de 100 — Moderado
```

**Bloque 2: Contexto comparativo** (separado visualmente del score)
```
Personas que empezaron en este rango:

El 69% de las personas mejoraron un 12-18% sus niveles en las primeras
72 h. del programa e incrementaron > 35% sus resultados al completar
el proceso de neuroregulación.

Las que actuaron en la primera semana avanzaron un 34% más rápido
que las que esperaron un mes.
```

- El "69%" va en **bold**.
- Sin degradados. Fondo sólido.
- La separación entre bloques debe ser clara — que se entienda que el bloque 2 habla de otras personas, no de ti.
- El texto "72" suelto (que aparecía antes como "El promedio de personas en tu situación que empezaron a regularse: 72") desaparece — se integra en el contexto narrativo.

---

Antes de escribir código:
1. Dime dónde están los datos de los mecanismos de defensa (nombres, descripciones).
2. Muéstrame el componente actual de resultados y dónde insertarías la nueva sección.
3. Identifica qué hace (o debería hacer) el botón "Descubrir tu perfil completo".
4. Espera mi aprobación.

## Reglas críticas
- NO modifiques la base de datos sin avisarme antes.
- TODO el diseño viene de docs/DESIGN.md. No inventes valores.
- CERO degradados en el diseño. Colores sólidos.
- La experiencia de resultados es CRÍTICA para la conversión. Es el momento Clarity → Confidence del journey.
- NUNCA ejecutes `npm run build` — usa `npx tsc --noEmit`.
- Para desplegar: `git push`. Vercel hace el build.
- Recuerda: no soy desarrollador. Explícame todo en lenguaje simple.

## Validación obligatoria (ANTES de cada commit)

### 1. Tipos y compilación
- Ejecuta `npx tsc --noEmit` — cero errores, cero warnings.

### 2. Testing funcional
- Completar el gateway entero y verificar:
  - El mecanismo de defensa adaptativo aparece en los resultados con nombre y descripción.
  - El efecto de revelación funciona (aparición progresiva, no todo de golpe).
  - El botón "Descubrir tu mecanismo de defensa completo" en el mapa FUNCIONA (abre contenido o navega).
  - La sección "Tu nivel de regulación" muestra el texto reestructurado correctamente.
  - Sin degradados en ninguna parte.

### 3. Diseño y UX
- Mobile-first 375px.
- La sección del mecanismo de defensa genera efecto WOW (revelación progresiva).
- Los dos bloques de "Tu nivel de regulación" están claramente separados.
- El botón del mapa funciona y da feedback al clic.

## Actualización de progreso
Después de completar:
1. Actualiza `docs/PROGRESS.md` con resumen de lo construido.
2. Commit final limpio con mensaje descriptivo.
