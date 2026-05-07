/**
 * /api/test-corto — Recibe respuestas del test corto y clasifica al lead.
 *
 * Body:
 *   { email, p1, p2, p3, p4, p5? }
 *
 * Respuesta:
 *   { ok: true, result: BucketResult }
 *
 * Side-effects:
 *   1. Inserta fila en Supabase tabla `short_test_responses` (idempotente por email).
 *   2. Añade el contacto a la audiencia Resend correspondiente al bucket.
 *   3. Dispara el primer email de la secuencia (Day 0) vía Resend.
 *
 * Variables de entorno requeridas:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   RESEND_API_KEY,
 *   RESEND_AUDIENCE_ANSIEDAD, RESEND_AUDIENCE_INSOMNIO,
 *   RESEND_AUDIENCE_FATIGA, RESEND_AUDIENCE_ESTRES,
 *   RESEND_FROM (ej. "Instituto Epigenético <hola@mail.institutoepigenetico.com>")
 */

import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import {
  classify,
  type ShortTestAnswers,
  type Bucket,
} from '@/lib/short-test-data'

export const runtime = 'nodejs'

interface RequestBody {
  email: string
  p1: 'A' | 'B' | 'C' | 'D' | 'E'
  p2: 'A' | 'B' | 'C' | 'D' | 'E'
  p3: 'A' | 'B' | 'C' | 'D' | 'E'
  p4: 'A' | 'B' | 'C' | 'D' | 'E'
  p5?: string
}

const AUDIENCE_BY_BUCKET: Record<Bucket, string | undefined> = {
  ansiedad: process.env.RESEND_AUDIENCE_ANSIEDAD,
  insomnio: process.env.RESEND_AUDIENCE_INSOMNIO,
  fatiga: process.env.RESEND_AUDIENCE_FATIGA,
  estres_cronico: process.env.RESEND_AUDIENCE_ESTRES,
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isOptId(s: unknown): s is 'A' | 'B' | 'C' | 'D' | 'E' {
  return typeof s === 'string' && ['A', 'B', 'C', 'D', 'E'].includes(s)
}

export async function POST(req: Request) {
  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 })
  }

  // Validación
  if (!isEmailValid(body.email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }
  for (const k of ['p1', 'p2', 'p3', 'p4'] as const) {
    if (!isOptId(body[k])) {
      return NextResponse.json({ ok: false, error: `invalid_${k}` }, { status: 400 })
    }
  }
  const p5 = typeof body.p5 === 'string' ? body.p5.slice(0, 200) : undefined

  const answers: ShortTestAnswers = { p1: body.p1, p2: body.p2, p3: body.p3, p4: body.p4, p5 }
  const result = classify(answers)

  // 1. Persistencia (Supabase). Si falla, devolvemos el resultado igual.
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    )
    await supabase.from('short_test_responses').upsert(
      {
        email: body.email.trim().toLowerCase(),
        p1: body.p1, p2: body.p2, p3: body.p3, p4: body.p4,
        p5,
        bucket: result.bucket,
        score_ansiedad: result.scores.ansiedad,
        score_insomnio: result.scores.insomnio,
        score_fatiga: result.scores.fatiga,
        score_estres: result.scores.estres_cronico,
        secondary_buckets: result.secondary,
        created_at: new Date().toISOString(),
      },
      { onConflict: 'email' },
    )
  } catch (e) {
    console.error('[test-corto] supabase_error', e)
  }

  // 2. + 3. Resend: añadir a audiencia + enviar Day 0
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!)
    const audienceId = AUDIENCE_BY_BUCKET[result.bucket]
    if (audienceId) {
      await resend.contacts.create({
        email: body.email.trim().toLowerCase(),
        audienceId,
        unsubscribed: false,
      })
    }
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Instituto Epigenético <hola@institutoepigenetico.com>',
      to: body.email.trim().toLowerCase(),
      subject: SUBJECT_BY_BUCKET[result.bucket],
      html: bodyHtml(result.bucket),
    })
  } catch (e) {
    console.error('[test-corto] resend_error', e)
  }

  return NextResponse.json({ ok: true, result })
}

// ─── PLANTILLAS MÍNIMAS DE EMAIL DAY 0 (placeholder, reescribir con copy real) ─

const SUBJECT_BY_BUCKET: Record<Bucket, string> = {
  ansiedad: 'Tu prioridad ahora es la ansiedad — primer paso',
  insomnio: 'Tu prioridad ahora es el sueño — protocolo de arranque',
  fatiga: 'Tu prioridad ahora es la fatiga — empezamos por aquí',
  estres_cronico: 'Tu prioridad ahora es el estrés crónico — primer movimiento',
}

function bodyHtml(bucket: Bucket): string {
  const lead = {
    ansiedad: 'Acabas de marcar la ansiedad como tu prioridad. Mañana te llega el primer recurso para regular tu sistema nervioso desde dentro — 4 minutos de lectura, una práctica de 7 minutos.',
    insomnio: 'Acabas de marcar el sueño como tu prioridad. Mañana te llega el primer paso del protocolo de descanso, basado en lo que has descrito en el test.',
    fatiga: 'Acabas de marcar la fatiga como tu prioridad. Mañana te llega un correo con la primera intervención — la fatiga no se soluciona durmiendo más.',
    estres_cronico: 'Acabas de marcar el estrés crónico como tu prioridad. Mañana te llega el primer movimiento del protocolo de neurorregulación.',
  }[bucket]

  return `<!doctype html>
<html lang="es">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 16px; color: #1a2e22; line-height: 1.6;">
    <p style="margin: 0 0 16px;">Hola,</p>
    <p style="margin: 0 0 16px;">${lead}</p>
    <p style="margin: 0 0 16px;">Si la urgencia es ahora, responde a este correo con una palabra: <strong>ahora</strong>. Lo veo y te respondo.</p>
    <p style="margin: 0 0 0;">Javier · Instituto Epigenético</p>
  </body>
</html>`
}
