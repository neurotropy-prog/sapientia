/**
 * /api/mapa/[hash]/reply — POST
 *
 * Permite al usuario responder a mensajes de Javier desde su mapa.
 * Guarda la respuesta en personal_actions y envía email de notificación a Javier.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { Resend } from 'resend'

function getResend(): Resend {
  return new Resend(process.env.RESEND_API_KEY ?? '')
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lars.institutoepigenetico.com'
}

const JAVIER_EMAIL = 'javier@neurotropy.com'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ hash: string }> },
) {
  const { hash } = await params

  let body: { type: 'comment' | 'video' | 'email'; content: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  if (!body.type || !['comment', 'video', 'email'].includes(body.type)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
  }

  if (!body.content?.trim()) {
    return NextResponse.json({ error: 'Contenido vacío' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Fetch lead
  const { data: row, error: fetchError } = await supabase
    .from('diagnosticos')
    .select('personal_actions, email, scores, profile')
    .eq('hash', hash)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Mapa no encontrado' }, { status: 404 })
  }

  // Create user reply action
  const reply = {
    type: `user_${body.type}` as string,
    content: body.content.trim(),
    created_at: new Date().toISOString(),
    from_user: true,
  }

  const existingActions = row.personal_actions ?? []
  const updatedActions = [...existingActions, reply]

  // Save to Supabase
  const { error: updateError } = await supabase
    .from('diagnosticos')
    .update({ personal_actions: updatedActions })
    .eq('hash', hash)

  if (updateError) {
    console.error('[mapa/reply] Error updating:', updateError)
    return NextResponse.json({ error: 'Error guardando respuesta' }, { status: 500 })
  }

  // Send notification email to Javier
  try {
    const leadEmail = row.email ?? 'desconocido'
    const globalScore = row.scores?.global ?? '?'
    const archetype = row.profile?.ego_primary ?? 'sin arquetipo'
    const typeLabel = body.type === 'comment' ? 'Comentario' : body.type === 'video' ? 'Vídeo' : 'Email'
    const mapUrl = `${getBaseUrl()}/mapa/${hash}`
    const adminUrl = `${getBaseUrl()}/admin`

    const html = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FFFFFF;font-family:'Host Grotesk',system-ui,sans-serif;color:#212426;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <tr><td>
      <p style="font-size:13px;letter-spacing:0.10em;text-transform:uppercase;color:#CD796C;margin:0 0 8px 0;font-weight:600;">
        RESPUESTA DE LEAD
      </p>
      <p style="font-size:22px;font-weight:600;color:#212426;margin:0 0 24px 0;line-height:1.3;">
        ${leadEmail} ha respondido
      </p>

      <div style="border:1px solid rgba(38,66,51,0.12);border-left:3px solid #CD796C;border-radius:8px;padding:20px;margin:0 0 24px 0;background:#F6F9F7;">
        <p style="font-size:12px;color:#878E92;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em;">
          ${typeLabel}
        </p>
        <p style="font-size:15px;color:#212426;line-height:1.6;margin:0;white-space:pre-line;">
          ${body.content.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </p>
      </div>

      <p style="font-size:13px;color:#878E92;margin:0 0 24px 0;">
        Score: ${globalScore}/100 · Arquetipo: ${archetype}
      </p>

      <table cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;">
        <tr>
          <td style="background:#264233;border-radius:100px;padding:14px 28px;">
            <a href="${adminUrl}" style="color:#FFFFFF;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap;">
              Abrir Hub
            </a>
          </td>
          <td style="width:12px;"></td>
          <td style="background:transparent;border:1px solid rgba(38,66,51,0.2);border-radius:100px;padding:14px 28px;">
            <a href="${mapUrl}" style="color:#264233;font-size:14px;font-weight:500;text-decoration:none;white-space:nowrap;">
              Ver mapa
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const isDev = process.env.NODE_ENV === 'development'
    await getResend().emails.send({
      from: isDev
        ? 'onboarding@resend.dev'
        : 'LARS Notificaciones <regulacion@institutoepigenetico.com>',
      to: JAVIER_EMAIL,
      subject: `💬 Respuesta de ${leadEmail} — ${typeLabel}`,
      html,
    })
  } catch (emailError) {
    // Don't fail the request if email fails
    console.error('[mapa/reply] Email notification error:', emailError)
  }

  return NextResponse.json({ ok: true, reply })
}
