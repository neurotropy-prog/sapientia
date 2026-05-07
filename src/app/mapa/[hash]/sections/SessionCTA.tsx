'use client'

/**
 * SessionCTA.tsx — CTA de sesión con Javier disponible desde día 0
 *
 * Aparece en Zona 4 del mapa (antes del CTA de compra).
 * Dos estados: no reservada (muestra BookingWidget) / reservada (confirmación).
 * Todos los textos editables desde admin.
 */

import { useState, useRef, useEffect } from 'react'
import { useCopy } from '@/lib/copy'
import BookingWidget from '@/components/booking/BookingWidget'
import BookingConfirmed from '@/components/booking/BookingConfirmed'

interface SessionCTAProps {
  mapHash: string
  booked: boolean
  bookingDetails?: {
    slotStart: string
    meetUrl: string | null
  } | null
}

export default function SessionCTA({ mapHash, booked: initialBooked, bookingDetails }: SessionCTAProps) {
  const { getCopy } = useCopy()
  const [booked, setBooked] = useState(initialBooked)
  const [currentBooking, setCurrentBooking] = useState(bookingDetails ?? null)
  const [expanded, setExpanded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

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

  function handleBooked(booking: { slotStart: string; meetUrl: string | null }) {
    setCurrentBooking(booking)
    setBooked(true)
  }

  function handleCancelled() {
    setCurrentBooking(null)
    setBooked(false)
    setExpanded(true)
  }

  const MARKER_STYLE: React.CSSProperties = {
    background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)',
    margin: '-2px -6px',
    padding: '2px 6px',
    color: 'inherit',
  }

  function highlightTitle(text: string): React.ReactNode {
    const target = 'tu sesión de asesoramiento'
    const idx = text.toLowerCase().indexOf(target)
    if (idx === -1) return text
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + target.length)
    const after = text.slice(idx + target.length)
    return <>{before}<mark style={MARKER_STYLE}>{match}</mark>{after}</>
  }

  return (
    <div
      ref={containerRef}
      style={{
        marginBottom: 'var(--space-6)',
        padding: 'var(--space-5)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(180, 90, 50, 0.15)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        transition:
          'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {booked && currentBooking ? (
        /* ── Estado reservado ── */
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: '16px' }}>&#10003;</span>
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                margin: 0,
              }}
            >
              {getCopy('mapa.sessionCta.booked.title')}
            </p>
          </div>
          <BookingConfirmed
            slotStart={currentBooking.slotStart}
            meetUrl={currentBooking.meetUrl}
            mapHash={mapHash}
            onCancelled={handleCancelled}
          />
        </div>
      ) : expanded ? (
        /* ── Booking widget expandido ── */
        <div>
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
              marginBottom: 'var(--space-2)',
              paddingLeft: 10,
            }}
          >
            {highlightTitle(getCopy('mapa.sessionCta.title'))}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-primary)',
              margin: 0,
              marginBottom: 'var(--space-4)',
              lineHeight: 'var(--lh-body-sm)',
              paddingLeft: 10,
            }}
          >
            {getCopy('mapa.sessionCta.subtitle')}
          </p>
          <BookingWidget mapHash={mapHash} onBooked={handleBooked} />
        </div>
      ) : (
        /* ── Estado inicial: CTA compacto ── */
        <div>
          {/* Badge */}
          <span
            style={{
              display: 'inline-block',
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--color-text-inverse)',
              background: 'var(--color-accent)',
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-3)',
            }}
          >
            {getCopy('mapa.sessionCta.badge')}
          </span>

          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              margin: 0,
              marginBottom: '2px',
              lineHeight: 'var(--lh-body-sm)',
              paddingLeft: 10,
            }}
          >
            {highlightTitle(getCopy('mapa.sessionCta.title'))}
          </p>

          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-primary)',
              margin: 0,
              marginBottom: 'var(--space-4)',
              lineHeight: 'var(--lh-body-sm)',
              paddingLeft: 10,
            }}
          >
            {getCopy('mapa.sessionCta.subtitle')}
          </p>

          <div className="session-cta-buttons" style={{ display: 'flex', gap: 'var(--space-3)', width: '100%' }}>
            <button
              onClick={() => setExpanded(true)}
              style={{
                background: '#CD796C',
                color: 'white',
                border: 'none',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-pill)',
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#DA7468'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#CD796C'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {getCopy('mapa.sessionCta.button')}
            </button>
            <a
              href="https://wa.me/34600000000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#66d072',
                color: 'white',
                border: 'none',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-pill)',
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#5abc64'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#66d072'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
