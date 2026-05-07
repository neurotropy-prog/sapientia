/**
 * /api/booking/create — POST
 *
 * Crea una reserva:
 * 1. Valida que el slot esta disponible (con lock de BD)
 * 2. Crea el booking en Supabase
 * 3. Crea el evento en Google Calendar con Meet
 * 4. Actualiza diagnosticos.funnel.session_booked
 * 5. Envia emails (confirmacion al usuario + notificacion a Javier)
 *
 * Body: { mapHash, slotStart, timezone }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { createCalendarEvent } from '@/lib/google-calendar'
import {
  sendBookingConfirmationEmail,
  sendBookingNotificationToJavier,
} from '@/lib/booking-emails'

interface CreateBookingBody {
  mapHash: string
  slotStart: string  // ISO string
  timezone: string
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: CreateBookingBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
  }

  const { mapHash, slotStart: slotStartStr, timezone } = body

  if (!mapHash || !slotStartStr || !timezone) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  const slotStart = new Date(slotStartStr)
  const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000) // +30 min

  // Validar que el slot esta en el futuro
  if (slotStart.getTime() <= Date.now() + 2 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: 'El slot debe ser al menos 2 horas en el futuro' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  try {
    // 1. Buscar diagnostico por hash
    const { data: diagnostico, error: diagError } = await supabase
      .from('diagnosticos')
      .select('id, email, funnel')
      .eq('hash', mapHash)
      .single()

    if (diagError || !diagnostico) {
      return NextResponse.json({ error: 'Mapa no encontrado' }, { status: 404 })
    }

    // Verificar que no tiene ya una sesion agendada
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('map_hash', mapHash)
      .eq('status', 'confirmed')
      .single()

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Ya tienes una sesion agendada' },
        { status: 409 }
      )
    }

    // 2. Verificar que el slot no esta tomado (race condition protection)
    const { data: slotTaken } = await supabase
      .from('bookings')
      .select('id')
      .eq('slot_start', slotStart.toISOString())
      .eq('status', 'confirmed')
      .single()

    if (slotTaken) {
      return NextResponse.json(
        { error: 'Este horario ya no esta disponible' },
        { status: 409 }
      )
    }

    // 3. Crear evento en Google Calendar
    let eventId = ''
    let meetUrl: string | null = null

    try {
      const calResult = await createCalendarEvent({
        summary: `Sesion L.A.R.S. — ${diagnostico.email}`,
        description: `Sesion de revision del Mapa de Regulacion.\n\nMapa: ${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/mapa/${mapHash}`,
        startTime: slotStart,
        endTime: slotEnd,
        attendeeEmail: diagnostico.email,
      })
      eventId = calResult.eventId
      meetUrl = calResult.meetUrl
    } catch (calError) {
      console.error('Error creando evento en Google Calendar:', calError)
      // Continuamos sin evento de GCal si falla (la reserva sigue siendo valida)
    }

    // 4. Crear booking en Supabase
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        diagnostico_id: diagnostico.id,
        email: diagnostico.email,
        map_hash: mapHash,
        slot_start: slotStart.toISOString(),
        slot_end: slotEnd.toISOString(),
        status: 'confirmed',
        google_event_id: eventId || null,
        google_meet_url: meetUrl,
      })
      .select('id, slot_start, slot_end, google_meet_url')
      .single()

    if (bookingError) {
      // Si es un error de unique constraint, el slot fue tomado
      if (bookingError.code === '23505') {
        return NextResponse.json(
          { error: 'Este horario ya no esta disponible' },
          { status: 409 }
        )
      }
      throw bookingError
    }

    // 5. Actualizar funnel del diagnostico
    const currentFunnel = (diagnostico.funnel as Record<string, unknown>) ?? {}
    await supabase
      .from('diagnosticos')
      .update({
        funnel: { ...currentFunnel, session_booked: true },
      })
      .eq('id', diagnostico.id)

    // 6. Enviar emails (en background, no bloquean la respuesta)
    sendBookingConfirmationEmail({
      to: diagnostico.email,
      slotStart,
      slotEnd,
      meetUrl,
      mapHash,
      userTimezone: timezone,
    }).catch((err) => console.error('Error enviando email de confirmacion:', err))

    sendBookingNotificationToJavier({
      userEmail: diagnostico.email,
      slotStart,
      mapHash,
    }).catch((err) => console.error('Error notificando a Javier:', err))

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        slotStart: booking.slot_start,
        slotEnd: booking.slot_end,
        meetUrl: booking.google_meet_url,
      },
    })
  } catch (error) {
    console.error('Error creando booking:', error)
    return NextResponse.json(
      { error: 'Error al crear la reserva' },
      { status: 500 }
    )
  }
}
