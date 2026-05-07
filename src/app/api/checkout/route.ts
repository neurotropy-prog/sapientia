/**
 * POST /api/checkout
 *
 * Crea una Stripe Checkout Session para la Semana 1.
 * Soporta EUR (por defecto) y MXN.
 * Devuelve { url } para redirigir al cliente.
 *
 * Body: { hash: string, currency?: 'eur' | 'mxn' }
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || key.startsWith('sk_test_xxx') || key === 'your_stripe_secret_key') return null
  return new Stripe(key)
}

const PRICE_IDS: Record<string, string | undefined> = {
  eur: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
  mxn: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MXN,
}

export async function POST(req: NextRequest) {
  let body: { hash?: string; currency?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const { hash, currency = 'eur' } = body
  if (!hash || typeof hash !== 'string') {
    return NextResponse.json({ error: 'Missing hash' }, { status: 400 })
  }

  const priceId = PRICE_IDS[currency]
  if (!priceId) {
    return NextResponse.json({ error: `Precio no configurado para ${currency.toUpperCase()}` }, { status: 400 })
  }

  const stripe = getStripe()
  if (!stripe) {
    return NextResponse.json({
      error: 'Stripe no configurado',
      demo: true,
    }, { status: 503 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lars.institutoepigenetico.com'
  const mapaUrl = `${baseUrl}/mapa/${hash}`

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        hash,
        product: 'lars_semana1',
        currency,
      },
      success_url: `${baseUrl}/pago/exito?session_id={CHECKOUT_SESSION_ID}&hash=${hash}`,
      cancel_url: mapaUrl,
      locale: 'es',
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe error:', err)
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 })
  }
}
