/**
 * /api/copy-update — POST (temporary endpoint for copy overrides)
 * Body: { key: string, value: string }
 * DELETE after use.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { key, value } = await req.json()
  if (!key || !value) {
    return NextResponse.json({ error: 'key and value required' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('copy_overrides')
    .update({ value })
    .eq('copy_key', key)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, key, value })
}
