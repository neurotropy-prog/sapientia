# DECISIONS.md — Historial de Decisiones

## Decisiones de producto (Alex + Javier)

| Fecha | Decisión | Contexto |
|-------|----------|----------|
| Mar 2026 | La landing ES el gateway | No hay landing separada. P1 visible en el hero. Una sola experiencia. |
| Mar 2026 | 4 secciones below the fold | Espejo + Tensión + Prueba Social + Alivio. Para quien necesite más antes de P1. |
| Mar 2026 | Testimonios adaptados de consultas reales | Javier selecciona 2-3 clientes, pide permiso. Cargo + edad, sin nombre. |
| Mar 2026 | Mapa vivo como activo central | URL única personal que evoluciona 90+ días. Testimonios del programa viven ahí, no en la landing. |
| Mar 2026 | Semana 1 como web separada (recomendado) | Pendiente confirmación de Javier. El río no se rompe. |

## Decisiones técnicas (Claude Code)

| Fecha | Decisión | Justificación |
|-------|----------|---------------|
| Mar 2026 | Next.js 15, Supabase, Resend, Stripe, Vercel | Ver docs/phases/PHASE_0_SETUP.md |
| Mar 2026 | Hash de 12 chars con crypto.randomBytes() | Sin dependencias extra. 36^12 combinaciones ≈ 4.7 trillones. Colisión improbable, verificada de todas formas. |
| Mar 2026 | API /api/diagnostico usa SUPABASE_SERVICE_ROLE_KEY | Datos de diagnóstico son privados. Nunca expuestos al cliente. Solo el service role puede leer/escribir la tabla diagnosticos. |
| Mar 2026 | Resend fire-and-forget en API route | El email no bloquea el redirect. Si falla el email, el mapa igual se carga. El redirect es inmediato. |
| Mar 2026 | Email repetido → devolver hash existente | No se sobreescriben datos. La persona puede volver a su mapa anterior. Futuro: ofrecer actualizar vs. ver existente. |
| Mar 2026 | Página /mapa/[hash] como Server Component | SSR: los scores se procesan en servidor, nunca en cliente. noindex per spec. |

## Decisiones v3 — Rediseño Mapa Vivo (Mar 2026)

| Fecha | Decisión | Justificación |
|-------|----------|---------------|
| Mar 2026 | Arquitectura 4 zonas (Estado + Foco + Mapa Completo + Camino) | Cada visita tiene UN foco, UN ritmo, UNA acción. El resto disponible pero no compitiendo. La persona sabe qué hay de nuevo en < 3 segundos. |
| Mar 2026 | FocusBanner con lógica visit-aware (NEW > PENDING > unpaid > teaser) | El foco cambia según el contexto de la visita. Contenido nuevo tiene prioridad, después acciones pendientes, después el CTA de pago. Cada perfil de cliente recibe el enfoque correcto. |
| Mar 2026 | Puentes líquidos eliminados | Los textos itálicos al pie de cada card olían a venta disfrazada. El deseo de profundizar nace de la experiencia (ver el score, leer el arquetipo), no de copy persuasivo. El acordeón ya señala qué hay disponible con badges NUEVO/PENDIENTE. |
| Mar 2026 | Timeline en lenguaje de transformación del cliente | El timeline habla de lo que el CLIENTE va a experimentar ("Tu cuerpo nota la diferencia"), no de lo que el sistema desbloquea ("Arquetipo del SN"). 5 puntos en vez de 8. Menos ruido, más claridad. |
| Mar 2026 | Sin cambios a map-evolution.ts, fast-forward, ni schema de BD | La lógica de evolución y los umbrales de desbloqueo funcionan correctamente. Los cambios son puramente de presentación — reorganización visual sin tocar la capa de datos. |

---

*Actualizar cuando se tome una decisión nueva.*
