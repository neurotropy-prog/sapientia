/**
 * POST /api/amplify/decline — Rechaza una comparación AMPLIFY
 *
 * No envía nada al invitador (privacidad).
 * Si el invitador acumula 3+ rechazos, se marca para co-learning.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

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
      { error: `No se puede rechazar: estado actual es "${invite.status}"` },
      { status: 400 },
    )
  }

  // ── Verificar que el invitee_hash corresponde ─────────────────────────────
  const { data: invitee } = await supabase
    .from('diagnosticos')
    .select('id')
    .eq('hash', invitee_hash.trim())
    .single()

  if (!invitee || invitee.id !== invite.invitee_id) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // ── Actualizar status ─────────────────────────────────────────────────────
  const { error: updateError } = await supabase
    .from('amplify_invites')
    .update({ status: 'declined' })
    .eq('id', invite.id)

  if (updateError) {
    console.error('[amplify/decline] Error updating invite:', updateError)
    return NextResponse.json({ error: 'Error rechazando comparación' }, { status: 500 })
  }

  // ── Anti-abuso: detectar patrón de rechazo (3+ rechazos) ─────────────────
  const { count: declinedCount } = await supabase
    .from('amplify_invites')
    .select('id', { count: 'exact', head: true })
    .eq('inviter_id', invite.inviter_id)
    .eq('status', 'declined')

  if ((declinedCount ?? 0) >= 3) {
    // Marcar en meta del invitador para co-learning
    const { data: inviterData } = await supabase
      .from('diagnosticos')
      .select('meta')
      .eq('id', invite.inviter_id)
      .single()

    if (inviterData) {
      const currentMeta = (inviterData.meta as Record<string, unknown>) ?? {}
      void supabase
        .from('diagnosticos')
        .update({
          meta: {
            ...currentMeta,
            amplify_rejection_pattern: true,
            amplify_declined_count: declinedCount,
          },
        })
        .eq('id', invite.inviter_id)
        .then(({ error }) => {
          if (error) console.error('[amplify/decline] Error marking rejection pattern:', error)
        })
    }

    console.warn(
      `[amplify/decline] Rejection pattern detected: inviter ${invite.inviter_id} has ${declinedCount} declined invites`,
    )
  }

  return NextResponse.json({ ok: true })
}
