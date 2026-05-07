/**
 * /api/booking/cancel — POST
 *
 * Cancela una reserva:
 * 1. Marca el booking como 'cancelled'
 * 2. Elimina el evento de Google Calendar
 * 3. Actualiza diagnosticos.funnel.session_booked = false
 *
 * Body: { mapHash }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { deleteCalendarEvent } from '@/lib/google-calendar'

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { mapHash: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
  }

  const { mapHash } = body
  if (!mapHash) {
    return NextResponse.json({ error: 'Falta mapHash' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    // 1. Buscar booking confirmado
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, google_event_id, diagnostico_id')
      .eq('map_hash', mapHash)
      .eq('status', 'confirmed')
      .single()

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'No hay sesion agendada para cancelar' },
        { status: 404 }
      )
    }

    // 2. Cancelar en Google Calendar
    if (booking.google_event_id) {
      try {
        await deleteCalendarEvent(booking.google_event_id)
      } catch (calError) {
        console.error('Error eliminando evento de GCal:', calError)
        // Continuamos aunque falle GCal
      }
    }

    // 3. Marcar como cancelled
    await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', booking.id)

    // 4. Actualizar funnel
    if (booking.diagnostico_id) {
      const { data: diagnostico } = await supabase
        .from('diagnosticos')
        .select('funnel')
        .eq('id', booking.diagnostico_id)
        .single()

      if (diagnostico) {
        const currentFunnel = (diagnostico.funnel as Record<string, unknown>) ?? {}
        await supabase
          .from('diagnosticos')
          .update({
            funnel: { ...currentFunnel, session_booked: false },
          })
          .eq('id', booking.diagnostico_id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error cancelando booking:', error)
    return NextResponse.json(
      { error: 'Error al cancelar la reserva' },
      { status: 500 }
    )
  }
}
