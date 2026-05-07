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
  whatsapp: string
  /** Email opcional — el lead viene del DB de leads del test largo, ya tenemos el email
   *  asociado al WhatsApp en el matching posterior. Si se pasa, se persiste. */
  email?: string
  p1: 'A' | 'B' | 'C' | 'D' | 'E'
  p2: 'A' | 'B' | 'C' | 'D' | 'E'
  p3: 'A' | 'B' | 'C' | 'D' | 'E'
  p4: 'A' | 'B' | 'C' | 'D' | 'E'
  p5?: string
}

// Resend ahora usa single audience + custom property "bucket" para segmentar.
// El audienceId de "General" lo configuramos en RESEND_AUDIENCE_ID.
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isWhatsAppValid(phone: string): boolean {
  return /^\+?\d{7,15}$/.test(phone.replace(/[\s\-().]/g, ''))
}

function normalizeWhatsApp(phone: string): string {
  return phone.replace(/[\s\-().]/g, '')
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
  if (typeof body.whatsapp !== 'string' || !isWhatsAppValid(body.whatsapp)) {
    return NextResponse.json({ ok: false, error: 'invalid_whatsapp' }, { status: 400 })
  }
  if (body.email !== undefined && !isEmailValid(body.email)) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 })
  }
  for (const k of ['p1', 'p2', 'p3', 'p4'] as const) {
    if (!isOptId(body[k])) {
      return NextResponse.json({ ok: false, error: `invalid_${k}` }, { status: 400 })
    }
  }
  const p5 = typeof body.p5 === 'string' ? body.p5.slice(0, 200) : undefined
  const whatsapp = normalizeWhatsApp(body.whatsapp)
  const email = body.email?.trim().toLowerCase()

  const answers: ShortTestAnswers = { p1: body.p1, p2: body.p2, p3: body.p3, p4: body.p4, p5 }
  const result = classify(answers)

  // 1. Persistencia (Supabase). Si falla, devolvemos el resultado igual.
  //    Clave primaria de unicidad: whatsapp (un lead, una fila — la última gana).
  //    Schema dedicado `sapientia` en el proyecto Supabase `flow` para aislar
  //    completamente del resto de tablas que ese proyecto pueda tener.
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false },
        db: { schema: 'sapientia' },
      },
    )
    await supabase.from('short_test_responses').upsert(
      {
        whatsapp,
        email: email ?? null,
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
      { onConflict: 'whatsapp' },
    )
  } catch (e) {
    console.error('[test-corto] supabase_error', e)
  }

  // 2. + 3. Resend: SOLO si tenemos email (puede venir del DB de leads del test largo,
  //    no del form actual). Si el email es null, saltamos el envío — el follow-up
  //    saldrá por WhatsApp.
  if (email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!)
      if (RESEND_AUDIENCE_ID) {
        await resend.contacts.create({
          email,
          audienceId: RESEND_AUDIENCE_ID,
          unsubscribed: false,
          // @ts-expect-error — properties soportado en API actual de Resend, no tipado en el SDK
          properties: { bucket: result.bucket, whatsapp },
        })
      }
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? 'Instituto Epigenético <hola@institutoepigenetico.com>',
        to: email,
        subject: SUBJECT_BY_BUCKET[result.bucket],
        html: bodyHtml(result.bucket),
      })
    } catch (e) {
      console.error('[test-corto] resend_error', e)
    }
  }

  return NextResponse.json({ ok: true, result })
}

// ─── EMAILS DAY 0 — copy en estilo Javier (frases 25-55 palabras) ────────────

const SUBJECT_BY_BUCKET: Record<Bucket, string> = {
  ansiedad: 'Tu ansiedad no es lo que crees',
  insomnio: 'Por qué tu mente no se apaga (y qué hacer hoy)',
  fatiga: 'La fatiga no se cura durmiendo más',
  estres_cronico: 'El estrés crónico no se relaja, se cierra',
}

const PARAGRAPHS_BY_BUCKET: Record<Bucket, string[]> = {
  ansiedad: [
    'La ansiedad que has marcado en el test no es un fallo de carácter ni un exceso de pensamiento; es la huella de un sistema nervioso que lleva semanas operando en modo simpático crónico, releyendo el entorno como si todavía hubiera un peligro inminente que no se ve.',
    'Lo primero que conviene saber es que la ansiedad casi nunca se desactiva pensando, porque la corteza prefrontal pierde fuerza en el momento en que la amígdala toma el mando del sistema nervioso.',
    'La vía rápida para volver al equilibrio pasa por el cuerpo, y más concretamente por la respiración: cuando alargas la exhalación al doble de la inhalación durante tres minutos seguidos, el nervio vago vuelve a tomar protagonismo y el sistema baja de marcha sin que haga falta razonarlo.',
    'Esa es la primera intervención que te pido que pruebes hoy, antes de dormir o cuando notes que la rumiación se acelera: cuatro segundos inhalando por la nariz, ocho segundos exhalando por la boca, durante tres minutos completos.',
    'Mañana te llega el segundo paso del protocolo de neurorregulación, que cierra el círculo: cómo intervenir el cortisol matutino para que el cuerpo no arranque ya en alerta antes de que la cabeza despierte.',
    'Si quieres contarme algo concreto sobre cómo se manifiesta tu ansiedad, responde a este correo con una palabra y leeré personalmente tu mensaje en menos de veinticuatro horas.',
  ],
  insomnio: [
    'El sueño que has marcado en el test no es solo cansancio: es la pista más fiable de cómo está funcionando tu sistema nervioso, porque dormir mal no genera estrés, dormir mal es la consecuencia visible de que el estrés ya está instalado en el cuerpo.',
    'Cuando la mente no se apaga al acostarse, lo que está pasando es que el eje cortisol-melatonina lleva días desacoplado, y la melatonina no termina de subir porque el cortisol no termina de bajar a la hora que le tocaba.',
    'La buena noticia es que ese eje se reentrena con un patrón muy concreto, sin necesidad de medicación ni de fuerza de voluntad, y la diferencia se nota en muy pocos días.',
    'El primer paso que te pido hoy es simple, casi físico: nada más despertarte, sal a la calle o asómate a una ventana abierta durante diez minutos, sin gafas de sol, mirando hacia el cielo de reojo.',
    'Ese impacto de luz directa marca el reloj del día y empieza a colocar el cortisol en su sitio para que la melatonina sepa cuándo aparecer doce horas más tarde, que es justo cuando la necesitas.',
    'Mañana te llega el segundo movimiento del protocolo, el que actúa sobre la noche y la transición a sueño profundo, justo donde se rompe la arquitectura del descanso reparador.',
    'Si quieres compartir cómo es tu insomnio en concreto, responde a este correo con una palabra y leeré cada respuesta en persona, no se contesta a máquina.',
  ],
  fatiga: [
    'La fatiga que has marcado no es vagancia ni falta de carácter, es la respuesta inteligente de un sistema nervioso que lleva tiempo invirtiendo más energía en gestionar amenazas internas que en generar disponibilidad real para el día siguiente.',
    'La energía que sientes no es la que tienes, es la que tu cerebro decide darte en función de la deuda metabólica que arrastra de las semanas anteriores, y por eso a veces no se corresponde con lo que has descansado.',
    'El cansancio crónico responde mucho más a la calidad de la recuperación entre esfuerzos que a la cantidad de descanso total acumulado, y eso cambia por completo la estrategia que tiene sentido seguir.',
    'El primer movimiento que te pido hoy es desactivar las micro-tomas de cortisol que probablemente estás haciendo sin darte cuenta: cero pantallas en la primera media hora del día, cero cafeína antes de desayunar, cero noticias antes de salir de casa.',
    'Eso solo, mantenido durante tres días seguidos, hace que el sistema empiece a recuperar reservas en lugar de gastarlas para arrancar la jornada como si fuera una emergencia.',
    'Mañana te llega la segunda intervención, que actúa sobre el sueño profundo y el ritmo de glucosa, que es la palanca donde la fatiga crónica realmente cede.',
    'Si quieres contarme cómo es tu fatiga (matinal, de tarde, mental, física), responde a este correo con una palabra y te leeré personalmente en menos de veinticuatro horas.',
  ],
  estres_cronico: [
    'El estrés crónico que has marcado en el test no es la versión grande de un mal día, es un patrón fisiológico distinto que se instala silenciosamente cuando el cuerpo lleva meses sin completar el ciclo de activación-desactivación que la naturaleza espera de él.',
    'Lo que está ocurriendo es que el eje hipotálamo-hipófisis-suprarrenal ha aprendido a operar en modo sostenido, y eso desplaza recursos desde la digestión, la reparación y la inmunidad hacia funciones de alerta que ya no son útiles para tu vida real.',
    'El cuerpo no se relaja porque ha olvidado cómo hacerlo, no por falta de voluntad ni de tiempo, y por eso intentar relajarse forzando la calma rara vez funciona cuando se llega a este punto.',
    'El primer movimiento que te pido hoy es tan concreto como contraintuitivo: en lugar de intentar relajarte, prueba a moverte intensamente durante seis minutos en intervalos cortos hasta que sudes, ya sea con sentadillas, jumping jacks o subir escaleras a ritmo.',
    'Esa carga aguda es lo que cierra ciclos abiertos y le da al cuerpo permiso para bajar después, porque la calma forzada sobre un sistema activado solo profundiza la disociación que probablemente ya estés sintiendo.',
    'Mañana te llega el segundo paso del protocolo de neurorregulación, que es el descenso real y la fase parasimpática que te falta para que el cuerpo recuerde cómo se baja de marcha.',
    'Si llevas demasiado tiempo así y quieres contármelo en una palabra, responde a este correo y leeré personalmente tu mensaje en menos de veinticuatro horas.',
  ],
}

function bodyHtml(bucket: Bucket): string {
  const paragraphs = PARAGRAPHS_BY_BUCKET[bucket]
  const body = paragraphs.map(p => `    <p style="margin: 0 0 18px;">${p}</p>`).join('\n')
  return `<!doctype html>
<html lang="es">
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 36px 20px; color: #1a2e22; line-height: 1.65; font-size: 16px;">
    <p style="margin: 0 0 18px;">Hola,</p>
${body}
    <p style="margin: 24px 0 4px;">Un abrazo,</p>
    <p style="margin: 0;"><strong>Javier Martín</strong><br/><span style="color: #5a6e63;">Instituto Epigenético</span></p>
  </body>
</html>`
}
