/**
 * GET /api/amplify/compare/[compare_hash] — Datos de la vista comparativa AMPLIFY
 *
 * Requiere ?viewer_hash= para verificar que el solicitante es una de las dos personas.
 * Cada persona ve "Tú" vs "Otro" (perspectiva personal).
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { generateComparisonInsight } from '@/lib/amplify-insights'
import type { DimensionScores } from '@/lib/amplify-insights'

interface DiagnosticoScores {
  global: number
  d1_regulacion: number
  d2_sueno: number
  d3_claridad: number
  d4_emocional: number
  d5_alegria: number
  label: string
}

function toDimensionScores(s: DiagnosticoScores): DimensionScores {
  return {
    global: s.global,
    d1: s.d1_regulacion,
    d2: s.d2_sueno,
    d3: s.d3_claridad,
    d4: s.d4_emocional,
    d5: s.d5_alegria,
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ compare_hash: string }> },
): Promise<NextResponse> {
  const { compare_hash } = await params
  const viewerHash = req.nextUrl.searchParams.get('viewer_hash')

  if (!compare_hash) {
    return NextResponse.json({ error: 'compare_hash requerido' }, { status: 400 })
  }

  if (!viewerHash) {
    return NextResponse.json({ error: 'viewer_hash requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Buscar invitación por compare_hash ────────────────────────────────────
  const { data: invite, error: inviteError } = await supabase
    .from('amplify_invites')
    .select('id, inviter_id, invitee_id, status, comparison_viewed_count')
    .eq('compare_hash', compare_hash.trim())
    .single()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Comparación no encontrada' }, { status: 404 })
  }

  if (invite.status !== 'accepted') {
    return NextResponse.json({ error: 'Comparación no disponible' }, { status: 400 })
  }

  // ── Cargar ambos diagnósticos ─────────────────────────────────────────────
  const { data: inviterDiag } = await supabase
    .from('diagnosticos')
    .select('id, hash, scores, profile')
    .eq('id', invite.inviter_id)
    .single()

  const { data: inviteeDiag } = await supabase
    .from('diagnosticos')
    .select('id, hash, scores, profile')
    .eq('id', invite.invitee_id)
    .single()

  if (!inviterDiag || !inviteeDiag) {
    return NextResponse.json({ error: 'Diagnósticos no encontrados' }, { status: 404 })
  }

  // ── Verificar que el viewer es una de las dos personas ────────────────────
  const isInviter = (inviterDiag.hash as string) === viewerHash.trim()
  const isInvitee = (inviteeDiag.hash as string) === viewerHash.trim()

  if (!isInviter && !isInvitee) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  // ── Incrementar contador de vistas (fire-and-forget) ──────────────────────
  const currentViews = (invite.comparison_viewed_count as number) ?? 0
  void supabase
    .from('amplify_invites')
    .update({ comparison_viewed_count: currentViews + 1 })
    .eq('id', invite.id)
    .then(({ error }) => {
      if (error) console.error('[amplify/compare] Error updating view count:', error)
    })

  // ── Preparar perspectiva (Tú vs Otro) ─────────────────────────────────────
  const myDiag = isInviter ? inviterDiag : inviteeDiag
  const theirDiag = isInviter ? inviteeDiag : inviterDiag

  const myScoresRaw = myDiag.scores as DiagnosticoScores
  const theirScoresRaw = theirDiag.scores as DiagnosticoScores

  const myScores = toDimensionScores(myScoresRaw)
  const theirScores = toDimensionScores(theirScoresRaw)

  const myProfile = ((myDiag.profile as Record<string, unknown>)?.ego_primary as string) ?? 'Desconocido'
  const theirProfile = ((theirDiag.profile as Record<string, unknown>)?.ego_primary as string) ?? 'Desconocido'

  // ── Generar insight (siempre desde perspectiva del invitador para personalización) ──
  const inviterScores = toDimensionScores(inviterDiag.scores as DiagnosticoScores)
  const inviteeScores = toDimensionScores(inviteeDiag.scores as DiagnosticoScores)
  const inviterProfile = ((inviterDiag.profile as Record<string, unknown>)?.ego_primary as string) ?? 'Desconocido'
  const inviteeProfile = ((inviteeDiag.profile as Record<string, unknown>)?.ego_primary as string) ?? 'Desconocido'

  const { text: insight, brecha_mayor } = generateComparisonInsight(
    inviterScores,
    inviteeScores,
    inviterProfile,
    inviteeProfile,
  )

  return NextResponse.json({
    my_scores: myScores,
    their_scores: theirScores,
    my_profile: myProfile,
    their_profile: theirProfile,
    insight,
    brecha_mayor,
  })
}
