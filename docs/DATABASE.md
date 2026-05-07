# DATABASE.md — Schema de Base de Datos

Base de datos: **Supabase (PostgreSQL)**

---

## Implementación actual (Fase 5)

### Tabla `diagnosticos`

Una tabla única con columnas JSONB para todos los datos de cada persona.
Enfoque: simplicidad + velocidad de iteración. No se normaliza hasta tener volumen que lo justifique.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK, default gen_random_uuid()) | Identificador interno |
| `email` | text (NOT NULL) | Email de la persona |
| `hash` | text (NOT NULL, UNIQUE) | 12 chars aleatorios — URL del mapa |
| `created_at` | timestamptz (default NOW()) | Cuándo se registró |
| `responses` | jsonb NOT NULL | Respuestas P1-P8 |
| `scores` | jsonb NOT NULL | Score global + 5 dimensiones |
| `profile` | jsonb DEFAULT '{}' | Ego, vergüenza, negación detectada |
| `map_evolution` | jsonb DEFAULT '{}' | Estado de evoluciones del mapa (días 3/7/14/21/30) |
| `confidence_chain` | jsonb DEFAULT '{}' | Cadena de depósitos de confianza |
| `funnel` | jsonb DEFAULT '{}' | Estado de conversión |
| `meta` | jsonb DEFAULT '{}' | Fuente, dispositivo, `last_visited_at` (ISO string) |

**Índices:** `email` y `hash` para búsqueda rápida.

**RLS:** Row Level Security activo. Solo el service role puede leer/escribir. Sin acceso público directo a la tabla.

---

## SQL de migración — Ejecutar en Supabase

Ve a **Supabase Dashboard → SQL Editor** y ejecuta este bloque completo:

```sql
-- ─── Tabla principal ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS diagnosticos (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL,
  hash          TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responses     JSONB       NOT NULL DEFAULT '{}',
  scores        JSONB       NOT NULL DEFAULT '{}',
  profile       JSONB       NOT NULL DEFAULT '{}',
  map_evolution JSONB       NOT NULL DEFAULT '{}',
  confidence_chain JSONB    NOT NULL DEFAULT '{}',
  funnel        JSONB       NOT NULL DEFAULT '{}',
  meta          JSONB       NOT NULL DEFAULT '{}'
);

-- ─── Índices ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_diagnosticos_email ON diagnosticos (email);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_hash  ON diagnosticos (hash);

-- ─── Row Level Security ───────────────────────────────────────────────────────
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;

-- Sin políticas públicas → solo el service_role_key puede acceder
-- Las API Routes del backend usan createAdminClient() con service_role_key
-- El frontend NUNCA tiene acceso directo a esta tabla
```

**Para revertir (si hace falta):**
```sql
DROP TABLE IF EXISTS diagnosticos;
```

---

## Estructura de los campos JSONB

### `responses`
```json
{
  "p1": "A",
  "p2": "B",
  "p3": ["A", "C", "E"],
  "p4": "A",
  "p5": "B",
  "p6": "A",
  "p7": {
    "regulacion": 3,
    "sueno": 2,
    "claridad": 4,
    "emocional": 3,
    "alegria": 2
  },
  "p8": "C"
}
```

### `scores`
```json
{
  "global": 34,
  "d1_regulacion": 28,
  "d2_sueno": 22,
  "d3_claridad": 45,
  "d4_emocional": 30,
  "d5_alegria": 25,
  "label": "Crítico"
}
```

### `profile`
```json
{
  "ego_primary": "Fuerte Invisible",
  "shame_level": "high",
  "denial_detected": true
}
```

### `funnel`
```json
{
  "gateway_completed": true,
  "email_captured": true,
  "map_visits": 0,
  "map_last_visit": null,
  "cta_clicked": false,
  "converted_week1": false,
  "converted_program": false,
  "session_booked": false
}
```

---

## Variables de entorno requeridas

Configura estas variables en **Vercel → Project Settings → Environment Variables** y en tu **`.env.local`** local:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...   ← NUNCA exponer al cliente

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx

# App
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

Cómo obtener las keys de Supabase:
- Ir a Supabase Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` → service_role key (mantener PRIVADA)

Cómo obtener la key de Resend:
- Ir a resend.com → API Keys → Create API Key
- Verificar el dominio de envío en resend.com → Domains
- Actualizar `FROM_EMAIL` en `src/lib/email.ts` con tu dominio verificado

---

## Tabla `bookings` (Sistema de reservas)

Reservas de sesiones de 20 minutos con Javier, integradas con Google Calendar.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador interno |
| `diagnostico_id` | uuid (FK → diagnosticos.id) | Referencia al diagnóstico |
| `email` | text NOT NULL | Email del usuario |
| `map_hash` | text NOT NULL | Hash del mapa (para link directo) |
| `slot_start` | timestamptz NOT NULL | Inicio del slot (UTC) |
| `slot_end` | timestamptz NOT NULL | Fin del slot (+20 min) |
| `status` | text NOT NULL DEFAULT 'confirmed' | confirmed / cancelled / completed / no_show |
| `google_event_id` | text | ID del evento en Google Calendar |
| `google_meet_url` | text | URL de la videollamada |
| `reminder_sent` | boolean DEFAULT false | Si se envió el recordatorio 24h |
| `created_at` | timestamptz DEFAULT NOW() | Cuándo se creó la reserva |
| `cancelled_at` | timestamptz | Cuándo se canceló (si aplica) |
| `completed_at` | timestamptz | Cuándo se completó/marcó no-show (migración 003) |
| `admin_notes` | text | Notas del admin sobre la sesión (migración 003) |

**Índice único parcial:** Solo 1 booking confirmado por `slot_start` (evita doble reserva).

**RLS:** Activo. Solo service_role_key puede acceder.

---

## Tabla `availability_config` (Configuración de disponibilidad)

Reglas de disponibilidad de Javier. Tres tipos de registros:
- **Recurrente:** día de la semana + horario (ej: "Lunes 10:00-13:00")
- **Bloqueo día completo:** fecha específica sin start_time/end_time (ej: vacaciones)
- **Bloqueo franja horaria:** fecha específica con start_time/end_time (ej: reunión de 10:00-12:00)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador interno |
| `day_of_week` | int | 0=Dom, 1=Lun ... 6=Sáb. NULL para bloqueos |
| `start_time` | time | Hora de inicio (ej: '10:00') |
| `end_time` | time | Hora de fin (ej: '13:00') |
| `specific_date` | date | Fecha a bloquear. NULL para reglas recurrentes |
| `is_blocked` | boolean DEFAULT false | true = bloquear esta fecha |
| `timezone` | text DEFAULT 'Europe/Madrid' | Zona horaria de referencia |
| `created_at` | timestamptz DEFAULT NOW() | Cuándo se creó |

**RLS:** Activo. Solo service_role_key puede acceder.

---

## SQL de migración — Bookings (Ejecutar en Supabase)

Ve a **Supabase Dashboard → SQL Editor** y ejecuta el contenido de:
`supabase/migrations/002_bookings.sql`

**Para revertir:**
```sql
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS availability_config;
```

## SQL de migración — Historial de sesiones (Ejecutar en Supabase)

Ve a **Supabase Dashboard → SQL Editor** y ejecuta el contenido de:
`supabase/migrations/003_booking_history.sql`

**Para revertir:**
```sql
ALTER TABLE bookings DROP COLUMN IF EXISTS completed_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS admin_notes;
```

---

## Tabla `amplify_invites` (Sistema AMPLIFY — Comparación de mapas)

Invitaciones para comparar mapas entre dos personas. Motor de crecimiento orgánico.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | uuid (PK) | Identificador interno |
| `invite_hash` | text (NOT NULL, UNIQUE) | 12 chars para la URL de invitación |
| `inviter_id` | uuid (FK → diagnosticos.id) | Quien invita |
| `invitee_id` | uuid (FK → diagnosticos.id) | Quien es invitado (NULL hasta que complete) |
| `status` | text NOT NULL DEFAULT 'pending' | pending / completed / accepted / declined / expired |
| `compare_hash` | text (UNIQUE) | Se genera al aceptar (para URL de comparación) |
| `created_at` | timestamptz DEFAULT NOW() | Cuándo se creó |
| `completed_at` | timestamptz | Cuando el invitado completa el gateway |
| `accepted_at` | timestamptz | Cuando el invitado acepta comparar |
| `profile_inviter` | text | Perfil del invitador (PC/FI/CE/CP) |
| `profile_invitee` | text | Perfil del invitado |
| `notified_reengagement` | boolean DEFAULT false | Para el sistema de re-engagement |
| `invitee_converted` | boolean DEFAULT false | ¿El invitado compró el programa? |
| `inviter_retained` | boolean DEFAULT false | ¿El invitador sigue activo 30d después? |
| `comparison_viewed_count` | integer DEFAULT 0 | Cuántas veces se ha visto la comparación |
| `outcome_measured_at` | timestamptz | Cuándo se midió el resultado |
| `meta` | jsonb DEFAULT '{}' | channel, relationship_hint |

**Índices:** `inviter_id`, `invitee_id`, `invite_hash`, `compare_hash`, `status`.

**RLS:** Activo. Solo service_role_key puede acceder.

**JSONB `meta`:**
```json
{
  "channel": "whatsapp",          // "whatsapp" | "email" | "link"
  "relationship_hint": "pareja"   // "pareja" | "socio" | "amigo" | null
}
```

**Campos AMPLIFY en `diagnosticos.meta`** (no requieren migración):
```json
{
  "referred_by": "abc123xyz456",        // invite_hash si vino por AMPLIFY
  "amplify_invites_sent": 2,            // Contador de invitaciones enviadas
  "amplify_comparisons_active": 1,      // Comparaciones activas
  "amplify_rejection_pattern": false,   // true si 3+ rechazos (co-learning)
  "amplify_declined_count": 0           // Total rechazos acumulados
}
```

### SQL de migración — amplify_invites

```sql
CREATE TABLE IF NOT EXISTS amplify_invites (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_hash             TEXT        NOT NULL UNIQUE,
  inviter_id              UUID        NOT NULL REFERENCES diagnosticos(id),
  invitee_id              UUID        REFERENCES diagnosticos(id),
  status                  TEXT        NOT NULL DEFAULT 'pending',
  compare_hash            TEXT        UNIQUE,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMPTZ,
  accepted_at             TIMESTAMPTZ,
  profile_inviter         TEXT,
  profile_invitee         TEXT,
  notified_reengagement   BOOLEAN     NOT NULL DEFAULT FALSE,
  invitee_converted       BOOLEAN     NOT NULL DEFAULT FALSE,
  inviter_retained        BOOLEAN     NOT NULL DEFAULT FALSE,
  comparison_viewed_count INTEGER     NOT NULL DEFAULT 0,
  outcome_measured_at     TIMESTAMPTZ,
  meta                    JSONB       NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_amplify_inviter ON amplify_invites (inviter_id);
CREATE INDEX IF NOT EXISTS idx_amplify_invitee ON amplify_invites (invitee_id);
CREATE INDEX IF NOT EXISTS idx_amplify_invite_hash ON amplify_invites (invite_hash);
CREATE INDEX IF NOT EXISTS idx_amplify_compare_hash ON amplify_invites (compare_hash);
CREATE INDEX IF NOT EXISTS idx_amplify_status ON amplify_invites (status);

ALTER TABLE amplify_invites ENABLE ROW LEVEL SECURITY;
```

**Para revertir:**
```sql
DROP TABLE IF EXISTS amplify_invites;
```

---

## Seguridad

- Los mapas vivos son privados por diseño.
- RLS activo en `diagnosticos`. Sin acceso público.
- La URL con hash (12 chars) es el único método de acceso al mapa.
- No hay autenticación pero las URLs no son indexables (noindex en metadata).
- Los scores y datos sensibles solo se muestran en la URL personal, nunca en APIs públicas.
- Todas las operaciones de BD van por `createAdminClient()` en rutas de API (backend), nunca desde el cliente.

---

## Variables de entorno nuevas (Google Calendar)

```
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key":"...","client_email":"lars-booking@tu-proyecto.iam.gserviceaccount.com",...}
GOOGLE_CALENDAR_ID=javier@institutoepigenetico.com
```

Cómo configurar:
1. Ir a **Google Cloud Console** → crear proyecto → habilitar **Calendar API**
2. Crear una **cuenta de servicio** → descargar JSON
3. En el calendario de Javier en Google Calendar → Compartir con el email de la cuenta de servicio (permisos: "Hacer cambios en eventos")
4. Copiar el JSON como variable de entorno `GOOGLE_SERVICE_ACCOUNT_KEY` en Vercel
5. Poner el email del calendario de Javier como `GOOGLE_CALENDAR_ID`

---

*L.A.R.S.© · Database Schema · Marzo 2026*
