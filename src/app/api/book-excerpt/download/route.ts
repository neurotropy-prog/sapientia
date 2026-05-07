/**
 * /api/book-excerpt/download — GET
 *
 * Genera una URL firmada temporal para descargar el extracto del libro.
 * Público (no requiere auth) — el PDF es contenido de marketing.
 * La URL expira en 1 hora.
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const BUCKET = 'book-excerpts'
const CONFIG_KEY = '_config.book_excerpt_pdf_path'

export async function GET() {
  const supabase = createAdminClient()

  const { data: config } = await supabase
    .from('copy_overrides')
    .select('value')
    .eq('copy_key', CONFIG_KEY)
    .single()

  if (!config?.value) {
    return NextResponse.json({ error: 'No PDF available' }, { status: 404 })
  }

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(config.value, 3600) // 1 hour

  if (error || !data?.signedUrl) {
    console.error('[book-excerpt/download] Signed URL error:', error)
    return NextResponse.json({ error: 'Error generating download URL' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
