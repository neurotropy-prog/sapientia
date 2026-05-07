-- ─── Migración 002: Sistema de reservas ──────────────────────────────────────
-- Tablas: bookings + availability_config
-- Ejecutar en Supabase Dashboard → SQL Editor

-- ─── Tabla de reservas ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostico_id  UUID        REFERENCES diagnosticos(id) ON DELETE SET NULL,
  email           TEXT        NOT NULL,
  map_hash        TEXT        NOT NULL,
  slot_start      TIMESTAMPTZ NOT NULL,
  slot_end        TIMESTAMPTZ NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'confirmed',
  google_event_id TEXT,
  google_meet_url TEXT,
  reminder_sent   BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at    TIMESTAMPTZ
);

-- Solo 1 booking confirmado por slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_confirmed_slot
  ON bookings (slot_start) WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings (email);
CREATE INDEX IF NOT EXISTS idx_bookings_map_hash ON bookings (map_hash);
CREATE INDEX IF NOT EXISTS idx_bookings_slot_start ON bookings (slot_start);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- Sin politicas publicas → solo service_role_key puede acceder

-- ─── Tabla de configuracion de disponibilidad ────────────────────────────────
CREATE TABLE IF NOT EXISTS availability_config (
  id            UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week   INT,
  start_time    TIME,
  end_time      TIME,
  specific_date DATE,
  is_blocked    BOOLEAN NOT NULL DEFAULT false,
  timezone      TEXT    NOT NULL DEFAULT 'Europe/Madrid',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE availability_config ENABLE ROW LEVEL SECURITY;
-- Sin politicas publicas → solo service_role_key puede acceder

-- ─── Para revertir ──────────────────────────────────────────────────────────
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS availability_config;
