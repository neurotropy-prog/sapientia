/**
 * GET /api/admin/email-preview?day=d0|d1|d3|d6|d10|d30
 *
 * Returns the email subject, body content, and CTA text for preview.
 * Uses defaults + any overrides from email_templates.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase'
import { EMAIL_DEFAULTS } from '@/lib/email-defaults'

const VALID_KEYS = ['d0', 'd1', 'd3', 'd6', 'd10', 'd30', 'd90', 'goodbye']

export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies()
  const { authorized, status } = await verifyAdmin(cookieStore)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const day = req.nextUrl.searchParams.get('day')
  if (!day || !VALID_KEYS.includes(day)) {
    return NextResponse.json({ error: `day inválido. Usa: ${VALID_KEYS.join(', ')}` }, { status: 400 })
  }

  const defaults = EMAIL_DEFAULTS[day]
  if (!defaults) {
    return NextResponse.json({ error: 'No hay defaults para este día' }, { status: 404 })
  }

  // Check for overrides
  let override: { subject: string | null; body_content: string | null; cta_text: string | null } | null = null
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('email_templates')
      .select('subject, body_content, cta_text')
      .eq('email_key', day)
      .single()
    override = data
  } catch {
    // No override
  }

  return NextResponse.json({
    emailKey: day,
    subject: override?.subject ?? defaults.subject,
    bodyContent: override?.body_content ?? defaults.bodyContent,
    ctaText: override?.cta_text ?? defaults.ctaText,
    isDynamic: defaults.isDynamic ?? false,
    dynamicNote: defaults.dynamicNote ?? null,
    hasOverride: !!override,
  })
}
