/**
 * GET /api/amplify/invite/[invite_hash] — Estado de una invitación AMPLIFY
 *
 * Devuelve el status y las iniciales del invitador (no su email ni nombre).
 * Usado por el gateway para detectar si el visitante viene por AMPLIFY.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

/** Extrae iniciales de un email: "javier.martin@..." → "JM" */
function getInitialsFromEmail(email: string): string {
  const local = email.split('@')[0] ?? ''
  // Split by dots, dashes, underscores
  const parts = local.split(/[.\-_]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  // Fallback: first two chars
  return local.substring(0, 2).toUpperCase()
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invite_hash: string }> },
): Promise<NextResponse> {
  const { invite_hash } = await params

  if (!invite_hash) {
    return NextResponse.json({ error: 'invite_hash requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Buscar invitación ─────────────────────────────────────────────────────
  const { data: invite, error } = await supabase
    .from('amplify_invites')
    .select('id, status, inviter_id, created_at')
    .eq('invite_hash', invite_hash.trim())
    .single()

  if (error || !invite) {
    return NextResponse.json({ status: 'not_found' })
  }

  // ── Verificar expiración (30 días) ────────────────────────────────────────
  const createdAt = new Date(invite.created_at as string)
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
  if (Date.now() - createdAt.getTime() > thirtyDaysMs) {
    // Marcar como expirada si no lo está ya
    if (invite.status === 'pending') {
      void supabase
        .from('amplify_invites')
        .update({ status: 'expired' })
        .eq('id', invite.id)
        .then(() => {})
    }
    return NextResponse.json({ status: 'expired' })
  }

  // ── Obtener iniciales del invitador ───────────────────────────────────────
  const { data: inviter } = await supabase
    .from('diagnosticos')
    .select('email')
    .eq('id', invite.inviter_id)
    .single()

  const inviterInitials = inviter?.email
    ? getInitialsFromEmail(inviter.email as string)
    : '??'

  return NextResponse.json({
    status: invite.status,
    inviter_initials: inviterInitials,
  })
}
