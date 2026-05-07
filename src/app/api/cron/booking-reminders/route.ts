/**
 * /api/cron/booking-reminders — GET
 *
 * Cron job (Vercel Cron): envia recordatorios 24h antes de la sesion.
 * Se ejecuta cada hora. Busca bookings entre 22-26h en el futuro
 * que aun no hayan recibido recordatorio.
 *
 * Protegido con CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { sendBookingReminderEmail } from '@/lib/booking-emails'

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Proteccion: solo Vercel Cron o CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Ventana: entre 22 y 26 horas en el futuro
    const now = new Date()
    const windowStart = new Date(now.getTime() + 22 * 60 * 60 * 1000)
    const windowEnd = new Date(now.getTime() + 26 * 60 * 60 * 1000)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, email, map_hash, slot_start, google_meet_url')
      .eq('status', 'confirmed')
      .eq('reminder_sent', false)
      .gte('slot_start', windowStart.toISOString())
      .lte('slot_start', windowEnd.toISOString())

    if (error) throw error

    let sent = 0
    for (const booking of bookings ?? []) {
      try {
        await sendBookingReminderEmail({
          to: booking.email,
          slotStart: new Date(booking.slot_start),
          meetUrl: booking.google_meet_url,
          mapHash: booking.map_hash,
          userTimezone: 'Europe/Madrid', // Fallback — ideal seria guardar la tz del usuario
        })

        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', booking.id)

        sent++
      } catch (emailError) {
        console.error(`Error enviando recordatorio a ${booking.email}:`, emailError)
      }
    }

    return NextResponse.json({
      success: true,
      reminders_sent: sent,
      total_pending: (bookings ?? []).length,
    })
  } catch (error) {
    console.error('Error en cron de recordatorios:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
