/**
 * /api/booking/slots — GET
 *
 * Devuelve los slots disponibles para los proximos 14 dias.
 * Publico (no requiere auth) — los slots son info publica.
 *
 * Query params:
 *   tz — timezone del usuario (ej: "America/Mexico_City"). Default: "Europe/Madrid"
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots, type TimeSlot } from '@/lib/availability'

interface SlotsByDay {
  date: string       // YYYY-MM-DD en la zona del usuario
  dateLabel: string   // "Lunes 22 de marzo"
  slots: Array<{
    start: string     // ISO string UTC
    end: string       // ISO string UTC
    timeLabel: string // "10:00" en la zona del usuario
  }>
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const tz = req.nextUrl.searchParams.get('tz') ?? 'Europe/Madrid'

    const slots = await getAvailableSlots()

    // Agrupar por dia en la zona horaria del usuario
    const grouped = groupSlotsByDay(slots, tz)

    return NextResponse.json(
      { slots: grouped, timezone: tz },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30',
        },
      }
    )
  } catch (error) {
    console.error('Error obteniendo slots:', error)
    return NextResponse.json(
      { error: 'Error al obtener disponibilidad' },
      { status: 500 }
    )
  }
}

function groupSlotsByDay(slots: TimeSlot[], tz: string): SlotsByDay[] {
  const dayMap = new Map<string, SlotsByDay>()

  for (const slot of slots) {
    const dateStr = slot.start.toLocaleDateString('en-CA', { timeZone: tz })
    const dateLabel = slot.start.toLocaleDateString('es-ES', {
      timeZone: tz,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    const timeLabel = slot.start.toLocaleTimeString('es-ES', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    if (!dayMap.has(dateStr)) {
      dayMap.set(dateStr, {
        date: dateStr,
        dateLabel: dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1),
        slots: [],
      })
    }

    dayMap.get(dateStr)!.slots.push({
      start: slot.start.toISOString(),
      end: slot.end.toISOString(),
      timeLabel,
    })
  }

  // Ordenar por fecha
  return Array.from(dayMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}
