-- Migracion 003: Historial de sesiones
-- Añade columnas para tracking de sesiones completadas y notas del admin.
--
-- Reversible:
--   ALTER TABLE bookings DROP COLUMN IF EXISTS completed_at;
--   ALTER TABLE bookings DROP COLUMN IF EXISTS admin_notes;

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
