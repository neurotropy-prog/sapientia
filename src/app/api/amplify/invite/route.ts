/**
 * POST /api/amplify/invite — Crea una invitación AMPLIFY
 *
 * Genera un link único para que el invitador lo comparta.
 * Límite: máximo 5 invitaciones activas por persona.
 * Anti-spam: máximo 5 invitaciones por hora.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateHash } from '@/lib/hash'

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { inviter_hash: string; channel?: string; relationship_hint?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { inviter_hash, channel, relationship_hint } = body

  if (!inviter_hash || typeof inviter_hash !== 'string') {
    return NextResponse.json({ error: 'inviter_hash requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Buscar invitador por hash ─────────────────────────────────────────────
  const { data: inviter, error: inviterError } = await supabase
    .from('diagnosticos')
    .select('id, profile, meta')
    .eq('hash', inviter_hash.trim())
    .single()

  if (inviterError || !inviter) {
    return NextResponse.json({ error: 'Mapa no encontrado' }, { status: 404 })
  }

  // ── Anti-spam: máximo 5 invitaciones en la última hora ────────────────────
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: recentCount } = await supabase
    .from('amplify_invites')
    .select('id', { count: 'exact', head: true })
    .eq('inviter_id', inviter.id)
    .gte('created_at', oneHourAgo)

  if ((recentCount ?? 0) >= 5) {
    console.warn(`[amplify/invite] Spam detected: inviter ${inviter.id} sent 5+ invites in 1h`)
    return NextResponse.json(
      { error: 'Has enviado demasiadas invitaciones. Inténtalo en una hora.' },
      { status: 429 },
    )
  }

  // ── Límite: máximo 5 invitaciones activas (pending o completed) ───────────
  const { count: activeCount } = await supabase
    .from('amplify_invites')
    .select('id', { count: 'exact', head: true })
    .eq('inviter_id', inviter.id)
    .in('status', ['pending', 'completed'])

  if ((activeCount ?? 0) >= 5) {
    return NextResponse.json(
      { error: 'Has alcanzado el límite de 5 invitaciones activas.' },
      { status: 400 },
    )
  }

  // ── Generar invite_hash único ─────────────────────────────────────────────
  let inviteHash = generateHash(12)
  const { data: hashCheck } = await supabase
    .from('amplify_invites')
    .select('id')
    .eq('invite_hash', inviteHash)
    .single()

  if (hashCheck) {
    inviteHash = generateHash(12)
  }

  // ── Extraer perfil del invitador ──────────────────────────────────────────
  const profileInviter = (inviter.profile as Record<string, unknown>)?.ego_primary as string | undefined

  // ── Insertar invitación ───────────────────────────────────────────────────
  const { error: insertError } = await supabase.from('amplify_invites').insert({
    invite_hash: inviteHash,
    inviter_id: inviter.id,
    status: 'pending',
    profile_inviter: profileInviter ?? null,
    meta: {
      ...(channel ? { channel } : {}),
      ...(relationship_hint ? { relationship_hint } : {}),
    },
  })

  if (insertError) {
    console.error('[amplify/invite] Error insertando:', insertError)
    return NextResponse.json({ error: 'Error creando invitación' }, { status: 500 })
  }

  // ── Actualizar contador en diagnosticos.meta ──────────────────────────────
  const currentMeta = (inviter.meta as Record<string, unknown>) ?? {}
  const currentSent = (currentMeta.amplify_invites_sent as number) ?? 0
  void supabase
    .from('diagnosticos')
    .update({ meta: { ...currentMeta, amplify_invites_sent: currentSent + 1 } })
    .eq('id', inviter.id)
    .then(({ error }) => {
      if (error) console.error('[amplify/invite] Error updating meta counter:', error)
    })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lars.institutoepigenetico.com'
  const inviteUrl = `${baseUrl}/?ref=${inviteHash}`

  return NextResponse.json({ invite_hash: inviteHash, invite_url: inviteUrl })
}
