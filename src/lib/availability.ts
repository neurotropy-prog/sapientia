/**
 * availability.ts — Logica de disponibilidad y calculo de slots
 *
 * Lee la configuracion de disponibilidad de Supabase, genera slots de 20 min,
 * y resta los que ya estan reservados.
 */

import { createAdminClient } from './supabase'

const SLOT_DURATION_MINUTES = 30
const BUFFER_MINUTES = 10
const LOOKAHEAD_DAYS = 14
const MIN_HOURS_BEFORE_SLOT = 2

interface AvailabilityRule {
  day_of_week: number | null
  start_time: string | null
  end_time: string | null
  specific_date: string | null
  is_blocked: boolean
  timezone: string
}

export interface TimeSlot {
  start: Date
  end: Date
}

/**
 * Obtiene los slots disponibles para los proximos 14 dias.
 * Los slots se devuelven en UTC.
 */
export async function getAvailableSlots(): Promise<TimeSlot[]> {
  const supabase = createAdminClient()

  // 1. Leer reglas de disponibilidad
  const { data: rules, error: rulesError } = await supabase
    .from('availability_config')
    .select('*')

  if (rulesError) throw new Error(`Error leyendo disponibilidad: ${rulesError.message}`)
  if (!rules || rules.length === 0) return []

  const typedRules = rules as AvailabilityRule[]

  // 2. Leer bookings confirmados en el rango
  const now = new Date()
  const rangeEnd = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000)

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('slot_start')
    .eq('status', 'confirmed')
    .gte('slot_start', now.toISOString())
    .lte('slot_start', rangeEnd.toISOString())

  if (bookingsError) throw new Error(`Error leyendo bookings: ${bookingsError.message}`)

  const bookedRanges = (bookings ?? []).map((b: { slot_start: string }) => {
    const start = new Date(b.slot_start).getTime()
    return {
      start,
      end: start + (SLOT_DURATION_MINUTES + BUFFER_MINUTES) * 60 * 1000,
    }
  })

  // 3. Separar reglas recurrentes, bloques de día completo y franjas horarias
  const recurringRules = typedRules.filter((r) => r.day_of_week !== null && !r.is_blocked)
  const fullDayBlocks = new Set(
    typedRules
      .filter((r) => r.specific_date && r.is_blocked && !r.start_time)
      .map((r) => r.specific_date!)
  )
  const timeRangeBlocks = typedRules.filter(
    (r) => r.specific_date && r.is_blocked && r.start_time && r.end_time
  )

  // 4. Generar slots dia a dia
  const slots: TimeSlot[] = []
  const minTime = now.getTime() + MIN_HOURS_BEFORE_SLOT * 60 * 60 * 1000

  for (let dayOffset = 0; dayOffset < LOOKAHEAD_DAYS; dayOffset++) {
    const day = new Date(now)
    day.setDate(day.getDate() + dayOffset)

    // Fecha en zona horaria de Madrid para comparar
    const madridDate = toMadridDateString(day)
    if (fullDayBlocks.has(madridDate)) continue

    // Obtener franjas horarias bloqueadas para este día (en UTC)
    const dayTimeBlocks = timeRangeBlocks
      .filter((r) => r.specific_date === madridDate)
      .map((r) => {
        const [bStartH, bStartM] = r.start_time!.split(':').map(Number)
        const [bEndH, bEndM] = r.end_time!.split(':').map(Number)
        return {
          start: madridDateToUTC(day, bStartH, bStartM).getTime(),
          end: madridDateToUTC(day, bEndH, bEndM).getTime(),
        }
      })

    const dayOfWeek = getMadridDayOfWeek(day)

    // Buscar reglas que aplican a este dia de la semana
    const dayRules = recurringRules.filter((r) => r.day_of_week === dayOfWeek)

    for (const rule of dayRules) {
      if (!rule.start_time || !rule.end_time) continue

      // Convertir horas de Madrid a UTC para este dia
      const [startH, startM] = rule.start_time.split(':').map(Number)
      const [endH, endM] = rule.end_time.split(':').map(Number)

      // Crear fecha en Madrid y convertir a UTC
      const blockStart = madridDateToUTC(day, startH, startM)
      const blockEnd = madridDateToUTC(day, endH, endM)

      // Generar slots de 20 min dentro del bloque
      let slotStart = blockStart.getTime()
      const blockEndTime = blockEnd.getTime()

      while (slotStart + SLOT_DURATION_MINUTES * 60 * 1000 <= blockEndTime) {
        const slotEnd = slotStart + SLOT_DURATION_MINUTES * 60 * 1000

        // Filtrar: slot en el futuro (con margen) y no reservado
        const isBooked = bookedRanges.some(r => slotStart >= r.start && slotStart < r.end)
        const isTimeBlocked = dayTimeBlocks.some(r => slotStart >= r.start && slotStart < r.end)
        if (slotStart >= minTime && !isBooked && !isTimeBlocked) {
          slots.push({
            start: new Date(slotStart),
            end: new Date(slotEnd),
          })
        }

        slotStart = slotEnd
      }
    }
  }

  return slots
}

// ─── Helpers de timezone ─────────────────────────────────────────────────────

/**
 * Obtiene la fecha en formato YYYY-MM-DD en zona horaria de Madrid.
 */
function toMadridDateString(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Madrid' })
}

/**
 * Obtiene el dia de la semana (0=domingo) en zona horaria de Madrid.
 */
function getMadridDayOfWeek(date: Date): number {
  const madridStr = date.toLocaleDateString('en-US', {
    timeZone: 'Europe/Madrid',
    weekday: 'short',
  })
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  }
  return dayMap[madridStr] ?? 0
}

/**
 * Convierte una hora en Madrid a un Date UTC para un dia dado.
 */
function madridDateToUTC(baseDate: Date, hours: number, minutes: number): Date {
  // Obtener la fecha en Madrid
  const madridDate = toMadridDateString(baseDate)
  const [year, month, day] = madridDate.split('-').map(Number)

  // Crear un string de fecha/hora con timezone de Madrid
  // Formato: "2026-03-22T10:00:00"
  const pad = (n: number) => n.toString().padStart(2, '0')
  const dateStr = `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`

  // Usar Intl para obtener el offset de Madrid en este momento especifico
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Madrid',
    timeZoneName: 'shortOffset',
  })

  // Crear fecha temporal para obtener offset de Madrid
  const tempDate = new Date(`${dateStr}Z`)
  const parts = formatter.formatToParts(tempDate)
  const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+1'

  // Parsear offset (ej: "GMT+2" → +2, "GMT+1" → +1)
  const offsetMatch = offsetPart.match(/GMT([+-]?\d+)(?::(\d+))?/)
  const offsetHours = offsetMatch ? parseInt(offsetMatch[1]) : 1
  const offsetMinutes = offsetMatch?.[2] ? parseInt(offsetMatch[2]) : 0
  const totalOffsetMs = (offsetHours * 60 + offsetMinutes) * 60 * 1000

  // Construir la fecha UTC = hora local de Madrid - offset
  const localMs = new Date(`${dateStr}Z`).getTime()
  return new Date(localMs - totalOffsetMs)
}
