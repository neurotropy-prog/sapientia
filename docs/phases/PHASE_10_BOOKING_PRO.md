# FASE 10 — SISTEMA DE RESERVAS PROFESIONAL
**Sesión dedicada de Claude Code**

---

## Contexto

El sistema de reservas ya funciona (slots de 20 min, widget de booking, Google Calendar, emails básicos), pero le faltan features clave para que Javi pueda usarlo como un profesional sin depender de herramientas externas. Esta fase lo convierte en un Calendly completo.

## Docs a leer ANTES de empezar

- `CLAUDE.md` — Reglas generales del proyecto
- `docs/DESIGN.md` — Paleta de colores, tipografía, tokens de diseño
- `docs/DATABASE.md` — Esquema actual de la base de datos
- Esta fase (`docs/phases/PHASE_10_BOOKING_PRO.md`) — Tú estás aquí

---

## Estado actual del sistema (auditoría)

### Lo que YA funciona
- Grilla de slots de 20 min con toggle por día/hora (`src/app/admin/disponibilidad/page.tsx`)
- Widget de booking 3 pasos: día → hora → confirmar (`src/components/booking/BookingWidget.tsx`)
- Google Calendar + Google Meet automático (`src/lib/google-calendar.ts`)
- Emails de confirmación + recordatorio 24h (`src/lib/booking-emails.ts`)
- Cancelación por parte del usuario (`src/app/api/booking/cancel/route.ts`)
- Protección anti-doble reserva (DB unique constraint + API check)
- Bloqueo de días completos desde el admin
- Generación de slots con timezone Madrid→UTC (`src/lib/availability.ts`)
- Cron de recordatorios (`src/app/api/cron/booking-reminders/route.ts`)

### Lo que FALTA (esta fase)
1. Bloquear franjas horarias específicas (no solo días completos)
2. Admin puede cancelar bookings de usuarios
3. Historial de sesiones (completadas, canceladas, no-show)
4. Buffer de 10 min entre sesiones
5. Emails con diseño premium (paleta DESIGN.md + showcase)

---

## Mejora 1: Bloquear franjas horarias específicas

### Problema
Si Javi tiene una reunión de 10 a 12 el martes, tiene que bloquear TODO el martes. Necesita poder bloquear solo esas horas.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/app/admin/disponibilidad/page.tsx` | UI: toggle "Todo el día / Solo una franja" + selectores de hora |
| `src/app/api/admin/disponibilidad/route.ts` | API: aceptar `startTime`/`endTime` opcionales con `specificDate` |
| `src/lib/availability.ts` | Lógica: filtrar slots dentro de bloqueos parciales |

### No requiere migración de DB
La tabla `availability_config` YA tiene columnas `start_time` y `end_time` (están en NULL para bloqueos de fecha). Solo hay que empezar a usarlas.

### Lógica de filtrado en `availability.ts`

**Actual (línea ~64-68):**
```ts
const blockedDates = new Set(
  typedRules.filter(r => r.specific_date && r.is_blocked).map(r => r.specific_date!)
)
// Luego: if (blockedDates.has(madridDate)) continue  // Skip día entero
```

**Nuevo:**
```ts
// Separar bloqueos de día completo vs franjas horarias
const fullDayBlocks = new Set(
  typedRules
    .filter(r => r.specific_date && r.is_blocked && !r.start_time)
    .map(r => r.specific_date!)
)

const timeRangeBlocks = typedRules.filter(
  r => r.specific_date && r.is_blocked && r.start_time && r.end_time
)

// En el loop de generación:
// 1. Si fullDayBlocks.has(madridDate) → skip día entero (como antes)
// 2. Si hay timeRangeBlock para ese día → skip solo slots que caen dentro del rango
```

### UI del admin

Sección "Bloquear fechas" actualizada:

```
[Selector de fecha]  [Toggle: ○ Todo el día / ● Franja horaria]
                     [Desde: 10:00]  [Hasta: 12:00]
                     [Bloquear]

Fechas bloqueadas:
┌─────────────────────────────────────────────┐
│ 🔴 Martes 25 de marzo · 10:00–12:00      ✕ │
│ 🔴 Viernes 28 de marzo · Todo el día     ✕ │
└─────────────────────────────────────────────┘
```

### Checklist
- [ ] Toggle "Todo el día / Franja" en la UI
- [ ] Selectores de hora (desde/hasta) con bloques de 20 min
- [ ] API acepta `startTime`/`endTime` con `specificDate` y `isBlocked: true`
- [ ] `getAvailableSlots()` filtra por franjas parciales
- [ ] Fechas bloqueadas parcialmente muestran el rango en la lista
- [ ] Test: bloquear 10:00-12:00 del martes → slots de 10:00, 10:20, 10:40, 11:00, 11:20, 11:40 desaparecen del widget

---

## Mejora 2: Admin cancela bookings

### Problema
Solo el usuario puede cancelar desde su mapa. Javi no tiene control. Si alguien no responde, el slot queda bloqueado.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/app/admin/disponibilidad/page.tsx` | Botón "Cancelar" en cada booking futuro |
| `src/app/api/admin/disponibilidad/route.ts` | Nuevo handler PATCH para cambiar status |

### Lógica de cancelación admin

Reutilizar la misma lógica de `src/app/api/booking/cancel/route.ts`:
1. Marcar booking como `status = 'cancelled'` + `cancelled_at = now()`
2. Borrar evento de Google Calendar (`deleteCalendarEvent`)
3. Actualizar `diagnosticos.funnel.session_booked = false`

**Diferencia:** La cancelación admin no necesita `mapHash` — usa el `booking.id` directamente.

### UI en el panel

Cada booking en "Próximas sesiones" muestra:
```
┌──────────────────────────────────────────────┐
│ Lun 24 mar · 10:00                Confirmada │
│ usuario@email.com           Ver mapa → │
│ Google Meet →                                │
│                                              │
│ [Cancelar sesión]                            │
└──────────────────────────────────────────────┘
```

El botón "Cancelar sesión" muestra un confirm() antes de ejecutar.

### Checklist
- [ ] Botón "Cancelar" en cada booking del panel admin
- [ ] Confirm dialog antes de cancelar
- [ ] API PATCH `/api/admin/disponibilidad` con `{ action: 'cancel_booking', bookingId: '...' }`
- [ ] Reutiliza lógica de cancelación existente (GCal + funnel)
- [ ] Toast de confirmación "Sesión cancelada"
- [ ] El slot queda libre inmediatamente para nuevas reservas

---

## Mejora 3: Historial de sesiones

### Problema
Javi no puede ver sesiones pasadas. No sabe cuáles se completaron, cuáles se cancelaron, cuáles fueron no-show.

### Migración de base de datos

```sql
-- Reversible: ALTER TABLE bookings DROP COLUMN completed_at; DROP COLUMN admin_notes;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
```

**Actualizar `docs/DATABASE.md`** con las nuevas columnas.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/app/admin/disponibilidad/page.tsx` | Nueva sección "Historial" + botones completar/no-show |
| `src/app/api/admin/disponibilidad/route.ts` | GET: traer sesiones pasadas. PATCH: completar/no-show |
| `supabase/migrations/003_booking_history.sql` | Migración para nuevas columnas |

### Acciones del admin sobre bookings

| Acción | Status resultante | Cuándo usar |
|--------|-------------------|-------------|
| Completar ✓ | `completed` | Sesión realizada con éxito |
| No-show ⚠ | `no_show` | El usuario no apareció |
| Cancelar ✕ | `cancelled` | Antes de la sesión |

### UI: Sección "Historial de sesiones"

Debajo de "Próximas sesiones", nueva sección:
```
HISTORIAL DE SESIONES
─────────────────────

┌──────────────────────────────────────────────┐
│ Lun 17 mar · 10:00            ● Completada  │ ← Badge verde
│ ana@email.com                  Ver mapa →    │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ Vie 14 mar · 16:20            ● Cancelada   │ ← Badge rojo
│ pedro@email.com                Ver mapa →    │
└──────────────────────────────────────────────┘
┌──────────────────────────────────────────────┐
│ Mié 12 mar · 11:00            ● No-show     │ ← Badge amarillo
│ laura@email.com                Ver mapa →    │
└──────────────────────────────────────────────┘
```

Últimas 30 sesiones, ordenadas por fecha descendente.

### Próximas sesiones con acciones

Los bookings futuros muestran botones de acción:
- Antes de la sesión: solo "Cancelar"
- Después de la hora: "Completar ✓" y "No-show ⚠"

### Checklist
- [ ] Migración SQL ejecutada en Supabase
- [ ] `docs/DATABASE.md` actualizado
- [ ] GET trae bookings pasados (completed, cancelled, no_show)
- [ ] PATCH cambia status a completed/no_show con timestamp
- [ ] Badges de color por status (verde/rojo/amarillo)
- [ ] Botones contextuales (cancelar antes, completar/no-show después)
- [ ] Últimas 30 sesiones en el historial

---

## Mejora 4: Buffer de 10 min entre sesiones

### Problema
Si Javi tiene sesión a las 10:00 (20 min), la siguiente puede ser a las 10:20 — sin descanso para prepararse.

### Archivo a modificar
`src/lib/availability.ts`

### Cambio

```ts
const BUFFER_MINUTES = 10

// Actual: solo excluye el slot exacto reservado
const bookedStartTimes = new Set(
  bookings.map(b => new Date(b.slot_start).getTime())
)

// Nuevo: excluye slot reservado + buffer posterior
const bookedRanges = bookings.map(b => ({
  start: new Date(b.slot_start).getTime(),
  end: new Date(b.slot_start).getTime() + (SLOT_DURATION_MINUTES + BUFFER_MINUTES) * 60 * 1000,
}))

// En el filtro de slots:
// Antes:  !bookedStartTimes.has(slotStart)
// Ahora:  !bookedRanges.some(r => slotStart >= r.start && slotStart < r.end)
```

**Resultado:** Si hay booking a las 10:00 (20 min), el siguiente slot disponible es a las 10:40 (10:20 está ocupado por la sesión, 10:20-10:30 es buffer).

Espera — en realidad con slots de 20 min, el buffer de 10 min hace que el siguiente slot disponible sea 10:40:
- 10:00-10:20 = sesión
- 10:20-10:30 = buffer
- 10:20 slot NO disponible (solapa con sesión)
- 10:40 slot = DISPONIBLE (empieza después del buffer)

### Checklist
- [ ] Constante `BUFFER_MINUTES = 10`
- [ ] `bookedStartTimes` → `bookedRanges` con buffer
- [ ] Test: con booking a 10:00, slot de 10:20 no aparece, 10:40 sí

---

## Mejora 5: Emails con diseño premium

### Problema
Los emails actuales tienen estilo correcto pero básico. Deben verse premium, como el showcase, con la paleta completa de DESIGN.md.

### Archivo a modificar
`src/lib/booking-emails.ts`

### Paleta para emails (de DESIGN.md)

| Token | Valor | Uso |
|-------|-------|-----|
| Fondo body | `#0a252c` | Background del email |
| Fondo card | `rgba(198,200,238,0.06)` | Cards de contenido |
| Texto principal | `#F5F5F0` | Títulos, contenido |
| Texto secundario | `#A8B0AC` | Labels, subtítulos |
| Acento lavanda | `#c6c8ee` | Overlines, links, bordes sutiles |
| Acento teal | `#5bbcb4` | Status positivos, badges |
| Error/cancelación | `#f87171` | Alertas, cancelaciones |
| Botón CTA | `background: #c6c8ee; color: #0a252c` | Botones pill |
| Tipografía títulos | `Plus Jakarta Sans` | Google Fonts |
| Tipografía cuerpo | `Inter` | Google Fonts |
| Border radius cards | `12px` | Bordes redondeados |
| Border sutil | `1px solid rgba(198,200,238,0.12)` | Bordes de cards |

### Estructura del email rediseñado

```
┌─────────────────────────────────────────────┐
│                                             │
│  INSTITUTO EPIGENÉTICO                      │  ← Overline lavanda
│  ─────────────────────                      │  ← Línea decorativa
│                                             │
│  Tu sesión con Javier                       │  ← Título grande
│  está confirmada.                           │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Fecha                              │    │  ← Card con borde sutil
│  │  Lunes 24 de marzo                  │    │
│  │                                     │    │
│  │  Hora                               │    │
│  │  10:00                              │    │
│  │                                     │    │
│  │  Duración                           │    │
│  │  20 minutos                         │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ENLACE DE VIDEOLLAMADA                     │
│  ┌─────────────────────────────────────┐    │
│  │  meet.google.com/xxx-xxx-xxx        │    │
│  └─────────────────────────────────────┘    │
│                                             │
│       [ Unirse a la videollamada ]          │  ← Botón pill lavanda
│                                             │
│  Si necesitas cancelar, puedes hacerlo      │
│  desde tu mapa epigenético.                 │
│                                             │
│  ─────────────────────                      │
│  Instituto Epigenético                      │  ← Footer
│  regulacion@institutoepigenetico.com        │
│                                             │
└─────────────────────────────────────────────┘
```

### Aplicar a los 3 templates

1. **Confirmación de reserva** — Título: "Tu sesión está confirmada" + detalles + Meet link
2. **Recordatorio 24h** — Título: "Tu sesión es mañana" + mismos detalles + Meet link
3. **Notificación admin** — Título: "Nueva sesión agendada" + email usuario + link al mapa

### Checklist
- [ ] Header con overline "INSTITUTO EPIGENÉTICO" + línea decorativa
- [ ] Card con borde sutil para detalles de sesión
- [ ] Botón pill lavanda para CTA
- [ ] Footer con datos de contacto
- [ ] Los 3 templates actualizados
- [ ] Test: enviar email de prueba y verificar en Gmail/Outlook
- [ ] Verificar que se ve bien en móvil (responsive, max-width 560px)

---

## Orden de ejecución

| # | Mejora | Complejidad | Archivos |
|---|--------|-------------|----------|
| 1 | Buffer 10 min entre sesiones | Baja | 1 archivo |
| 2 | Bloquear franjas horarias | Media | 3 archivos |
| 3 | Admin cancela + historial | Media-Alta | 3 archivos + 1 migración |
| 4 | Emails premium | Media | 1 archivo |

## Verificación final

1. **Buffer:** Crear booking a las 10:00 → verificar que 10:20 no aparece en el widget, 10:40 sí
2. **Franjas:** Bloquear 10:00-12:00 del martes → esos 6 slots desaparecen del widget
3. **Admin cancel:** Cancelar booking desde panel → GCal se borra, slot se libera
4. **Historial:** Completar sesión pasada → aparece en historial con badge verde
5. **Emails:** Enviar confirmación → verificar diseño premium en inbox
6. **Deploy:** `npx vercel --prod --yes` y verificar todo en producción

---

## Regla CLAUDE.md aplicable

> Si una pantalla no tiene sus animaciones y transiciones implementadas, NO ESTÁ TERMINADA.

En esta fase no hay animaciones nuevas (es admin + backend). Las transiciones existentes del panel (`transition: all var(--transition-base)`) son suficientes.
