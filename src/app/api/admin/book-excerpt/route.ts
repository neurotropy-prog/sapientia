/**
 * /api/admin/book-excerpt — POST (upload) / GET (status) / DELETE
 *
 * Admin endpoint para gestionar el extracto del libro en PDF.
 * Almacena el PDF en Supabase Storage (bucket 'book-excerpts', privado).
 * Guarda la referencia en copy_overrides con key '_config.book_excerpt_pdf_path'.
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyAdmin } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB
const BUCKET = 'book-excerpts'
const CONFIG_KEY = '_config.book_excerpt_pdf_path'

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { error } = await supabase.storage.getBucket(BUCKET)
  if (error) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: MAX_SIZE,
    })
    if (createError) {
      throw new Error(`Error creating bucket: ${createError.message}`)
    }
  }
}

// ── GET — Check if PDF exists and return info ──────────────────────────────

export async function GET() {
  const cookieStore = await cookies()
  const { authorized, status } = await verifyAdmin(cookieStore)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const supabase = createAdminClient()

  const { data: config } = await supabase
    .from('copy_overrides')
    .select('value, updated_at')
    .eq('copy_key', CONFIG_KEY)
    .single()

  if (!config?.value) {
    return NextResponse.json({ exists: false })
  }

  // Get file metadata
  const { data: files } = await supabase.storage.from(BUCKET).list('', {
    search: config.value,
  })

  const file = files?.[0]

  return NextResponse.json({
    exists: true,
    path: config.value,
    updatedAt: config.updated_at,
    fileName: file?.name ?? config.value,
    fileSize: file?.metadata?.size ?? null,
  })
}

// ── POST — Upload PDF ──────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const { authorized, status, user } = await verifyAdmin(cookieStore)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Solo se aceptan archivos PDF.' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Archivo demasiado grande. Máximo 20MB.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  await ensureBucket(supabase)

  // Delete previous PDF if exists
  const { data: existingConfig } = await supabase
    .from('copy_overrides')
    .select('value')
    .eq('copy_key', CONFIG_KEY)
    .single()

  if (existingConfig?.value) {
    await supabase.storage.from(BUCKET).remove([existingConfig.value])
  }

  // Upload new PDF
  const path = `extracto-libro-${Date.now()}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (uploadError) {
    console.error('[book-excerpt] Upload error:', uploadError)
    return NextResponse.json({ error: 'Error subiendo archivo' }, { status: 500 })
  }

  // Save path in copy_overrides
  await supabase
    .from('copy_overrides')
    .upsert({
      copy_key: CONFIG_KEY,
      value: path,
      updated_by: user?.email ?? 'admin',
    })

  return NextResponse.json({ success: true, path })
}

// ── DELETE — Remove PDF ────────────────────────────────────────────────────

export async function DELETE() {
  const cookieStore = await cookies()
  const { authorized, status } = await verifyAdmin(cookieStore)
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status })
  }

  const supabase = createAdminClient()

  const { data: config } = await supabase
    .from('copy_overrides')
    .select('value')
    .eq('copy_key', CONFIG_KEY)
    .single()

  if (config?.value) {
    await supabase.storage.from(BUCKET).remove([config.value])
  }

  await supabase
    .from('copy_overrides')
    .delete()
    .eq('copy_key', CONFIG_KEY)

  return NextResponse.json({ success: true })
}
