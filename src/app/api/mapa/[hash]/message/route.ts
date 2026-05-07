/**
 * /api/mapa/[hash]/message — PATCH
 *
 * Permite al usuario del mapa marcar mensajes como saved/dismissed.
 * Body: { index: number, saved?: boolean, dismissed?: boolean }
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import type { PersonalAction } from '@/lib/profile-intelligence'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params

  let body: { index: number; saved?: boolean; dismissed?: boolean; content?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  if (typeof body.index !== 'number') {
    return NextResponse.json({ error: 'index requerido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: row, error: fetchError } = await supabase
    .from('diagnosticos')
    .select('personal_actions')
    .eq('hash', hash)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
  }

  const actions: PersonalAction[] = row.personal_actions ?? []

  if (body.index < 0 || body.index >= actions.length) {
    return NextResponse.json({ error: 'Índice fuera de rango' }, { status: 400 })
  }

  // Update the specific action
  if (typeof body.saved === 'boolean') {
    actions[body.index] = { ...actions[body.index], saved: body.saved }
  }
  if (typeof body.dismissed === 'boolean') {
    actions[body.index] = { ...actions[body.index], dismissed: body.dismissed }
  }
  if (typeof body.content === 'string' && body.content.trim()) {
    actions[body.index] = { ...actions[body.index], content: body.content.trim() }
  }

  const { error: updateError } = await supabase
    .from('diagnosticos')
    .update({ personal_actions: actions })
    .eq('hash', hash)

  if (updateError) {
    console.error('[mapa/message] Error updating:', updateError)
    return NextResponse.json({ error: 'Error guardando' }, { status: 500 })
  }

  return NextResponse.json({ success: true, action: actions[body.index] })
}
