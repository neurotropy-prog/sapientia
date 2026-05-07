/**
 * /api/admin/templates/action-preview — GET
 *
 * Devuelve el HTML renderizado de un email de acción sugerida con datos de ejemplo.
 * Query params:
 *   ?type=personal_note|video|early_unlock|express_session|manual_email
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdmin } from '@/lib/admin-auth'
import { escapeHtml } from '@/lib/email-defaults'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://lars.institutoepigenetico.com'
const LOGO_URL = `${BASE_URL}/Logo-definitivo-IE.png`
const SAMPLE_MAP_URL = `${BASE_URL}/mapa/sample123abc`

const VALID_TYPES = ['personal_note', 'video', 'early_unlock', 'express_session', 'manual_email'] as const
type ActionType = (typeof VALID_TYPES)[number]

// Sample content for each action type
const SAMPLE_CONTENT: Record<ActionType, { subject: string; body: string; cta: string }> = {
  personal_note: {
    subject: 'Un mensaje de Javier sobre tu análisis',
    body: 'He revisado tu mapa con atención. Tu dimensión de Regulación Nerviosa tiene un patrón que veo en personas con alta responsabilidad profesional — no es solo estrés, es un sistema nervioso que lleva demasiado tiempo en modo supervivencia.\n\nQuería que lo supieras porque cambia lo que deberías priorizar.',
    cta: 'Ver mi mapa',
  },
  video: {
    subject: 'Javier ha grabado algo para ti',
    body: 'He grabado un breve mensaje personalizado sobre lo que he visto en tu mapa. No es genérico — es específico para tu situación.\n\nTe lo he dejado directamente en tu mapa vivo.',
    cta: 'Ver mensaje de Javier',
  },
  early_unlock: {
    subject: 'Contenido nuevo desbloqueado en tu mapa',
    body: 'He desbloqueado de forma anticipada las subdimensiones y el insight de inteligencia colectiva en tu mapa.\n\nAhora puedes ver con mayor resolución qué está pasando en cada área — especialmente en la dimensión que más te afecta.',
    cta: 'Ver mi mapa',
  },
  express_session: {
    subject: 'Javier quiere hablar contigo — 10 minutos',
    body: 'Mirando tu mapa, creo que 10 minutos de conversación te ahorrarían semanas de incertidumbre.\n\nHe reservado un hueco express para ti. Sin compromiso, sin venta — solo contexto sobre lo que tu mapa muestra.',
    cta: 'Ver mi mapa',
  },
  manual_email: {
    subject: 'Un mensaje del Instituto Epigenético',
    body: 'Este es un email personalizado escrito directamente por Javier.\n\nEl contenido lo define el director al momento de enviarlo — puede ser cualquier mensaje relevante para la situación específica del lead.',
    cta: 'Ver mi mapa',
  },
}

function buildActionPreview(type: ActionType): string {
  const sample = SAMPLE_CONTENT[type]
  const isVideo = type === 'video'
  const mapUrl = isVideo ? `${SAMPLE_MAP_URL}?video=1` : SAMPLE_MAP_URL

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background-color:#FFFFFF;font-family:'Host Grotesk',system-ui,sans-serif;color:#212426;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:48px 24px;">
    <tr><td>
      <img src="${LOGO_URL}" alt="Instituto Epigenético" width="220" style="display:block;width:220px;height:auto;margin:0 0 32px 0;" />
      <p style="font-size:14px;color:#212426;line-height:1.8;margin:0 0 32px 0;white-space:pre-line;">${escapeHtml(sample.body)}</p>
      <table cellpadding="0" cellspacing="0" style="margin:0 0 32px 0;">
        <tr><td style="background:#264233;border-radius:100px;padding:16px 32px;">
          <a href="${mapUrl}" style="color:#FFFFFF;font-size:15px;font-weight:500;text-decoration:none;display:block;white-space:nowrap;">
            ${escapeHtml(isVideo ? 'Ver mensaje de Javier' : 'Ver mi mapa')}
          </a>
        </td></tr>
      </table>
      <div style="height:1px;background:rgba(38, 66, 51, 0.10);margin-bottom:24px;"></div>
      <p style="font-size:13px;color:#878E92;line-height:1.6;margin:0;">Confidencial. Solo tú puedes verlo.</p>
    </td></tr>
  </table>
</body>
</html>`
}

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const { authorized, status } = await verifyAdmin(cookieStore)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const url = new URL(req.url)
  const type = url.searchParams.get('type') as ActionType | null

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `Tipo inválido. Válidos: ${VALID_TYPES.join(', ')}` },
      { status: 400 },
    )
  }

  const html = buildActionPreview(type)
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
