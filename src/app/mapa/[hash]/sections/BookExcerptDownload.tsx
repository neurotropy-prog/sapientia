'use client'

/**
 * BookExcerptDownload.tsx — Descarga del extracto del libro (PDF)
 *
 * Solo se renderiza si hay un PDF subido desde el admin.
 * El PDF se descarga vía URL firmada temporal de Supabase Storage.
 * Todos los textos editables desde admin.
 */

import { useState, useRef, useEffect } from 'react'
import { useCopy } from '@/lib/copy'

interface BookExcerptDownloadProps {
  pdfUrl: string | null
}

export default function BookExcerptDownload({ pdfUrl }: BookExcerptDownloadProps) {
  const { getCopy } = useCopy()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!pdfUrl) return null

  async function handleDownload() {
    if (!pdfUrl) return
    setDownloading(true)
    try {
      const res = await fetch('/api/book-excerpt/download')
      if (!res.ok) throw new Error('Download failed')
      const data = await res.json()
      if (data.url) {
        window.open(data.url, '_blank')
      }
    } catch {
      // Fallback: direct link
      window.open(pdfUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-secondary)',
        border: 'var(--border-subtle)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition:
          'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Book icon + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(180, 90, 50, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8" />
            <path d="M8 11h5" />
          </svg>
        </div>
        <div>
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
              lineHeight: 'var(--lh-body-sm)',
            }}
          >
            {getCopy('mapa.bookDownload.title')}
          </p>
        </div>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-caption)',
          color: 'var(--color-text-secondary)',
          margin: 0,
          marginBottom: 'var(--space-4)',
          lineHeight: 'var(--lh-body-sm)',
        }}
      >
        {getCopy('mapa.bookDownload.description')}
      </p>

      <button
        onClick={handleDownload}
        disabled={downloading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          background: 'transparent',
          color: 'var(--color-accent)',
          border: '1px solid var(--color-accent)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: '9999px',
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 600,
          cursor: downloading ? 'default' : 'pointer',
          opacity: downloading ? 0.7 : 1,
          transition: 'all 0.2s ease',
          width: '100%',
        }}
        onMouseEnter={(e) => {
          if (!downloading) {
            e.currentTarget.style.background = 'var(--color-accent)'
            e.currentTarget.style.color = 'var(--color-text-inverse)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-accent)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        {downloading ? 'Descargando…' : getCopy('mapa.bookDownload.button')}
      </button>
    </div>
  )
}
