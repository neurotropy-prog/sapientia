/**
 * /api/mapa/[hash]/upload-video — POST
 *
 * Permite al usuario subir un vídeo desde su mapa.
 * Sube a Supabase Storage (bucket 'videos') y guarda
 * la URL como personal_action de tipo user_video.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { Resend } from 'resend'

const MAX_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
const BUCKET = 'videos'

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

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Formato no permitido. Acepta MP4, MOV, WebM.' },
      { status: 400 },
    )
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: 'Archivo demasiado grande. Máximo 50 MB.' },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()

  // Verify map exists
  const { data: row, error: fetchError } = await supabase
    .from('diagnosticos')
    .select('personal_actions, email, scores, profile')
    .eq('hash', hash)
    .single()

  if (fetchError || !row) {
    return NextResponse.json({ error: 'Mapa no encontrado' }, { status: 404 })
  }

  // Ensure bucket exists
  const { error: bucketError } = await supabase.storage.getBucket(BUCKET)
  if (bucketError) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true })
    if (createError) {
      console.error('[upload-video] Error creating bucket:', createError)
      return NextResponse.json({ error: 'Error creando storage' }, { status: 500 })
    }
  }

  // Upload file
  const ext = file.name.split('.').pop() ?? 'mp4'
  const path = `${hash}/user_${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('[upload-video] Error uploading:', uploadError)
    return NextResponse.json({ error: 'Error subiendo vídeo' }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  const videoUrl = urlData.publicUrl

  // Save as personal action
  const reply = {
    type: 'user_video',
    content: videoUrl,
    created_at: new Date().toISOString(),
    from_user: true,
  }

  const existingActions = row.personal_actions ?? []
  const updatedActions = [...existingActions, reply]

  const { error: updateError } = await supabase
    .from('diagnosticos')
    .update({ personal_actions: updatedActions })
    .eq('hash', hash)

  if (updateError) {
    console.error('[upload-video] Error updating actions:', updateError)
    return NextResponse.json({ error: 'Error guardando vídeo' }, { status: 500 })
  }

  // Notify Javier
  try {
    const leadEmail = row.email ?? 'desconocido'
    const globalScore = row.scores?.global ?? '?'
    const archetype = row.profile?.ego_primary ?? 'sin arquetipo'
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
        VÍDEO DE LEAD
      </p>
      <p style="font-size:22px;font-weight:600;color:#212426;margin:0 0 24px 0;line-height:1.3;">
        ${leadEmail} ha subido un vídeo
      </p>

      <div style="border:1px solid rgba(38,66,51,0.12);border-left:3px solid #CD796C;border-radius:8px;padding:20px;margin:0 0 24px 0;background:#F6F9F7;">
        <p style="font-size:12px;color:#878E92;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:0.05em;">
          Vídeo
        </p>
        <a href="${videoUrl}" style="font-size:15px;color:#4875dc;">Ver vídeo</a>
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
      subject: `🎥 Vídeo de ${leadEmail}`,
      html,
    })
  } catch (emailError) {
    console.error('[upload-video] Email notification error:', emailError)
  }

  return NextResponse.json({ ok: true, reply })
}
