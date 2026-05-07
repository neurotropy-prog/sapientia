/**
 * POST /api/amplify/accept — Acepta una comparación AMPLIFY
 *
 * Valida que ambos mapas existen, genera compare_hash,
 * y envía email al invitador: "Tu comparación está lista."
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateHash } from '@/lib/hash'
import { sendAmplifyComparisonReadyEmail } from '@/lib/email'

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { invite_hash: string; invitee_hash: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const { invite_hash, invitee_hash } = body

  if (!invite_hash || !invitee_hash) {
    return NextResponse.json({ error: 'invite_hash e invitee_hash requeridos' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Buscar invitación ─────────────────────────────────────────────────────
  const { data: invite, error: inviteError } = await supabase
    .from('amplify_invites')
    .select('id, inviter_id, invitee_id, status')
    .eq('invite_hash', invite_hash.trim())
    .single()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 })
  }

  if (invite.status !== 'completed') {
    return NextResponse.json(
      { error: `No se puede aceptar: estado actual es "${invite.status}"` },
      { status: 400 },
    )
  }

  // ── Verificar que el invitee_hash corresponde al invitee_id ───────────────
  const { data: invitee } = await supabase
    .from('diagnosticos')
    .select('id, profile')
    .eq('hash', invitee_hash.trim())
    .single()

  if (!invitee || invitee.id !== invite.invitee_id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // ── Buscar invitador ──────────────────────────────────────────────────────
  const { data: inviter } = await supabase
    .from('diagnosticos')
    .select('email, hash')
    .eq('id', invite.inviter_id)
    .single()

  if (!inviter) {
    return NextResponse.json({ error: 'Invitador no encontrado' }, { status: 404 })
  }

  // ── Generar compare_hash ──────────────────────────────────────────────────
  let compareHash = generateHash(12)
  const { data: hashCheck } = await supabase
    .from('amplify_invites')
    .select('id')
    .eq('compare_hash', compareHash)
    .single()

  if (hashCheck) {
    compareHash = generateHash(12)
  }

  // ── Extraer perfil del invitado ───────────────────────────────────────────
  const profileInvitee = (invitee.profile as Record<string, unknown>)?.ego_primary as string | undefined

  // ── Actualizar invitación ─────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('amplify_invites')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
      compare_hash: compareHash,
      profile_invitee: profileInvitee ?? null,
    })
    .eq('id', invite.id)

  if (updateError) {
    console.error('[amplify/accept] Error updating invite:', updateError)
    return NextResponse.json({ error: 'Error aceptando comparación' }, { status: 500 })
  }

  // ── Actualizar meta del invitador (comparaciones activas) ─────────────────
  const { data: inviterFull } = await supabase
    .from('diagnosticos')
    .select('meta')
    .eq('id', invite.inviter_id)
    .single()

  if (inviterFull) {
    const currentMeta = (inviterFull.meta as Record<string, unknown>) ?? {}
    const activeCount = ((currentMeta.amplify_comparisons_active as number) ?? 0) + 1
    void supabase
      .from('diagnosticos')
      .update({ meta: { ...currentMeta, amplify_comparisons_active: activeCount } })
      .eq('id', invite.inviter_id)
      .then(({ error }) => {
        if (error) console.error('[amplify/accept] Error updating inviter meta:', error)
      })
  }

  // ── Email al invitador (fire-and-forget) ──────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lars.institutoepigenetico.com'
  const compareUrl = `${baseUrl}/mapa/${inviter.hash}/comparar/${compareHash}`

  /** Extraer iniciales del invitado */
  const { data: inviteeData } = await supabase
    .from('diagnosticos')
    .select('email')
    .eq('id', invitee.id)
    .single()

  const inviteeEmail = (inviteeData?.email as string) ?? ''
  const localPart = inviteeEmail.split('@')[0] ?? ''
  const parts = localPart.split(/[.\-_]/).filter(Boolean)
  const inviteeInitials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : localPart.substring(0, 2).toUpperCase()

  void sendAmplifyComparisonReadyEmail({
    to: inviter.email as string,
    inviteeInitials,
    compareUrl,
    inviterMapHash: inviter.hash as string,
  }).catch((err) => {
    console.error('[amplify/accept] Error sending comparison ready email:', err)
  })

  return NextResponse.json({
    compare_hash: compareHash,
    compare_url: compareUrl,
  })
}
