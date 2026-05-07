'use client'

/**
 * AspiracionalTimeline.tsx — Zona 4: Tu Camino de Regulación
 *
 * Estructura (v2 — Feedback-F):
 *   BLOQUE A — ProgramaCompleto: 3 fases expandibles con 12 semanas
 *   BLOQUE B — SessionCTA: Reserva sesión con Javier (disponible desde día 0)
 *   BLOQUE C — BookExcerptDownload: Descarga del extracto del libro (si hay PDF)
 *   BLOQUE D — Reencuadre de precio (desde 2.500€)
 *   BLOQUE E — CTA completo (pre-CTA emocional + botón + garantía + acordeón)
 *
 * Caso hasPaid: misma estructura con badge "EN CURSO" + mensaje de confirmación.
 */

import { useEffect, useRef, useState } from 'react'
import { useCopy } from '@/lib/copy'
import Card from '@/components/ui/Card'
import ProgramaCompleto from './ProgramaCompleto'
import SessionCTA from './SessionCTA'
import BookExcerptDownload from './BookExcerptDownload'
import ProgressiveUnlockModule from './ProgressiveUnlockModule'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface Props {
  score: number
  hasPaid: boolean
  daysSinceCreation: number
  reevaluationScore?: number | null
  onStartWeek1: () => void
  checkoutLoading: boolean
  checkoutError: string | null
  onRetryCheckout: () => void
  // New props for session and PDF
  mapHash: string
  sessionBooked: boolean
  sessionBookingDetails?: {
    slotStart: string
    meetUrl: string | null
  } | null
  bookExcerptPdfUrl: string | null
  // Currency
  currency: 'eur' | 'mxn'
  onCurrencyChange: (c: 'eur' | 'mxn') => void
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function AspiracionalTimeline({
  score,
  hasPaid,
  daysSinceCreation,
  reevaluationScore,
  onStartWeek1,
  checkoutLoading,
  checkoutError,
  onRetryCheckout,
  mapHash,
  sessionBooked,
  sessionBookingDetails,
  bookExcerptPdfUrl,
  currency,
  onCurrencyChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [accordionOpen, setAccordionOpen] = useState(false)
  const { getCopy } = useCopy()

  // IntersectionObserver para fade-up al entrar en viewport (A-15)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const week1Items = [
    {
      title: getCopy('mapa.aspiracional.week1.item1.title'),
      description: getCopy('mapa.aspiracional.week1.item1.description'),
    },
    {
      title: getCopy('mapa.aspiracional.week1.item2.title'),
      description: getCopy('mapa.aspiracional.week1.item2.description'),
    },
    {
      title: getCopy('mapa.aspiracional.week1.item3.title'),
      description: getCopy('mapa.aspiracional.week1.item3.description'),
    },
    {
      title: getCopy('mapa.aspiracional.week1.item4.title'),
      description: getCopy('mapa.aspiracional.week1.item4.description'),
    },
  ]

  return (
    <div
      ref={containerRef}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition:
          'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <style>{`
        @media (max-width: 639px) {
          .aspiracional-cuerpo-block {
            margin-top: var(--space-4) !important;
            margin-bottom: var(--space-3) !important;
          }
        }
      `}</style>
      {/* ══════════════════════════════════════════════════════════════════════
          BLOQUE A — Headline + Programa Completo (12 semanas)
          ══════════════════════════════════════════════════════════════════════ */}

      {/* Programa de 12 semanas expandible */}
      <div id="programa-detalle">
        <ProgramaCompleto hasPaid={hasPaid} />
      </div>

      {/* Nota de evolución del mapa — F1: min 15px, F2: negro */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-text-primary)',
          marginTop: 0,
          marginBottom: 'var(--space-6)',
          paddingLeft: 10,
          lineHeight: 'var(--lh-body-sm)',
        }}
      >
        ¿Quieres <mark style={{ background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)', margin: '-2px -6px', padding: '2px 6px', color: 'inherit' }}>saber</mark> si el programa <mark style={{ background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)', margin: '-2px -6px', padding: '2px 6px', color: 'inherit' }}>puede encajar en tu agenda</mark>? ¿Tienes dudas que necesites que te aclaremos? Reserva una cita de 30' sin compromiso.
      </p>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOQUE B — Sesión con Javier (disponible desde día 0)
          ══════════════════════════════════════════════════════════════════════ */}
      <div id="session-cta">
        <SessionCTA
          mapHash={mapHash}
          booked={sessionBooked}
          bookingDetails={sessionBookingDetails}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          BLOQUE C — Extracto del libro (PDF, si existe)
          ══════════════════════════════════════════════════════════════════════ */}
      <BookExcerptDownload pdfUrl={bookExcerptPdfUrl} />

      {/* ══════════════════════════════════════════════════════════════════════
          BLOQUE D+E — Reencuadre + CTA (o confirmación si pagado)
          ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: 'relative',
          padding: 'var(--space-6) var(--space-8)',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--color-bg-secondary)',
          border: 'var(--border-subtle)',
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
        }}
      >
        {/* Currency selector — top right */}
        {!hasPaid && (
          <div
            style={{
              position: 'absolute',
              top: 'var(--space-4)',
              right: 'var(--space-4)',
              display: 'flex',
              borderRadius: '20px',
              overflow: 'hidden',
              border: '1px solid rgba(38, 66, 51, 0.15)',
              fontSize: 'var(--text-caption)',
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 600,
            }}
          >
            <button
              onClick={() => onCurrencyChange('eur')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                border: 'none',
                cursor: 'pointer',
                background: currency === 'eur' ? 'rgba(38,66,51,0.08)' : 'transparent',
                color: currency === 'eur' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                transition: 'all 200ms ease',
              }}
            >
              <span style={{ fontSize: '12px' }}>🇪🇺</span> EUR
            </button>
            <button
              onClick={() => onCurrencyChange('mxn')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 10px',
                border: 'none',
                borderLeft: '1px solid rgba(38, 66, 51, 0.15)',
                cursor: 'pointer',
                background: currency === 'mxn' ? 'rgba(38,66,51,0.08)' : 'transparent',
                color: currency === 'mxn' ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                transition: 'all 200ms ease',
              }}
            >
              <span style={{ fontSize: '12px' }}>🇲🇽</span> MXN
            </button>
          </div>
        )}

        {hasPaid ? (
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-primary)',
                lineHeight: 'var(--lh-body)',
                margin: 0,
              }}
            >
              {getCopy('mapa.aspiracional.hasPaid.title')}
            </p>
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--lh-body)',
                margin: 0,
                marginTop: 'var(--space-1)',
              }}
            >
              {getCopy('mapa.aspiracional.hasPaid.description')}
            </p>
          </div>
        ) : (
          <>
            {/* Texto pre-CTA */}
            <div
              className="aspiracional-cuerpo-block"
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-h3)',
                fontWeight: 700,
                lineHeight: 1.4,
                margin: 0,
                marginTop: 'var(--space-8)',
                marginBottom: 'var(--space-6)',
                textAlign: 'left',
              }}
            >
              <p style={{ color: '#c27d70', margin: 0 }}>Tu cuerpo no está roto. Está harto.</p>
              <p style={{ color: '#264233', margin: 0 }}>Es el desgaste de una biología que ha llegado a su límite.</p>
            </div>

            {/* BLOQUE D — Reencuadre de precio */}
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body)',
                lineHeight: 'var(--lh-body)',
                margin: 0,
                paddingBottom: 'var(--space-6)',
              }}
            >
              <strong style={{ color: '#c27d70', textDecoration: 'underline double', textDecorationColor: '#c27d70', textUnderlineOffset: '3px' }}>El programa completo tiene tres niveles de acompañamiento desde {currency === 'mxn' ? '$49,000 MXN' : '1.500€'} (financiables), según la profundidad que necesites.</strong>{' '}
              <span style={{ color: 'var(--color-text-primary)' }}>La elección del plan viene después — cuando hayas comprobado con tu propio cuerpo que esto funciona.</span>
            </p>

            {/* BLOQUE E — CTA completo */}
            <div style={{ textAlign: 'center' }}>

              {/* Botón CTA */}
              <button
                onClick={onStartWeek1}
                disabled={checkoutLoading}
                style={{
                  background: 'var(--color-accent)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  padding: 'var(--space-3) var(--space-5)',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  width: '100%',
                  maxWidth: '400px',
                  cursor: checkoutLoading ? 'default' : 'pointer',
                  opacity: checkoutLoading ? 0.7 : 1,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (!checkoutLoading) {
                    e.currentTarget.style.background = 'var(--color-accent-hover)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-accent)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {checkoutLoading
                  ? getCopy('mapa.aspiracional.checkout.loading')
                  : currency === 'mxn'
                    ? 'Empieza la Semana 1 por $1,920 MXN'
                    : getCopy('mapa.aspiracional.ctaButton')}
              </button>

              {/* Error de checkout */}
              {checkoutError && (
                <div
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    background: 'rgba(239,68,68,0.08)',
                    marginTop: 'var(--space-3)',
                    textAlign: 'center',
                  }}
                >
                  <p
                    style={{
                      fontFamily: 'var(--font-host-grotesk)',
                      fontSize: 'var(--text-body-sm)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-2)',
                    }}
                  >
                    {getCopy('mapa.aspiracional.checkout.error')}
                  </p>
                  <button
                    onClick={onRetryCheckout}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      borderRadius: '9999px',
                      border: 'var(--border-subtle)',
                      background: 'transparent',
                      color: 'var(--color-accent)',
                      fontFamily: 'var(--font-host-grotesk)',
                      fontSize: 'var(--text-caption)',
                      cursor: 'pointer',
                    }}
                  >
                    {getCopy('mapa.aspiracional.checkout.retry')}
                  </button>
                </div>
              )}

              {/* Garantía — bold */}
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  textAlign: 'center',
                  lineHeight: 'var(--lh-body)',
                  marginTop: 'var(--space-3)',
                  marginBottom: 0,
                }}
              >
                {currency === 'mxn'
                  ? 'Si tu sueño no mejora en 7 días, te devolvemos los $1,920 MXN.'
                  : getCopy('mapa.aspiracional.guarantee')}
              </p>

              {/* ── Acordeón colapsable: Qué incluye la Semana 1 ── */}
              <div
                style={{
                  marginTop: 'var(--space-5)',
                  textAlign: 'left',
                }}
              >
                <button
                  onClick={() => setAccordionOpen(!accordionOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: 'var(--space-3) var(--space-5)',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 700,
                    color: '#1a1a1a',
                  }}
                >
                  <mark style={{ background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)', margin: '-2px -6px', padding: '2px 6px', color: 'inherit' }}>{getCopy('mapa.aspiracional.week1.accordion.title')}</mark>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                      transform: accordionOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 200ms ease',
                      flexShrink: 0,
                      marginLeft: 'var(--space-2)',
                    }}
                  >
                    <path
                      d="M4.5 2.5L8 6L4.5 9.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div
                  style={{
                    maxHeight: accordionOpen ? '1200px' : '0px',
                    overflow: 'hidden',
                    transition:
                      'max-height 400ms cubic-bezier(0.16, 1, 0.3, 1)',
                    marginBottom: accordionOpen ? '20px' : '0px',
                  }}
                >
                  <div
                    style={{
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-4)',
                      border: 'var(--border-subtle)',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      minWidth: 0,
                    }}
                  >
                    {/* Presentaciones del Dr. Carlos Alvear */}
                    <p
                      style={{
                        fontFamily: 'var(--font-host-grotesk)',
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        marginBottom: 'var(--space-3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {getCopy('mapa.programa.week1.presentations.title')}
                    </p>
                    {[
                      getCopy('mapa.programa.week1.pres1'),
                      getCopy('mapa.programa.week1.pres2'),
                      getCopy('mapa.programa.week1.pres3'),
                    ].map((pres, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 'var(--space-2)',
                          marginBottom: 'var(--space-2)',
                          minWidth: 0,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-host-grotesk)',
                            fontSize: 'var(--text-body-sm)',
                            fontWeight: 600,
                            color: 'var(--color-accent)',
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}.
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-host-grotesk)',
                            fontSize: 'var(--text-body-sm)',
                            fontWeight: 700,
                            color: '#c27d70',
                            lineHeight: 'var(--lh-body-sm)',
                            textDecoration: 'underline',
                            textDecorationStyle: 'double' as React.CSSProperties['textDecorationStyle'],
                            textDecorationColor: '#4875dc',
                            textUnderlineOffset: '3px',
                            minWidth: 0,
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                          }}
                        >
                          {pres}
                        </span>
                      </div>
                    ))}

                    {/* Qué vas a aprender */}
                    <div style={{ height: '1px', background: 'rgba(180, 90, 50, 0.1)', margin: 'var(--space-4) 0' }} />
                    <p
                      style={{
                        fontFamily: 'var(--font-host-grotesk)',
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                        margin: 0,
                        marginBottom: 'var(--space-2)',
                      }}
                    >
                      {getCopy('mapa.programa.week1.learning.title')}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--font-host-grotesk)',
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-text-primary)',
                        lineHeight: 'var(--lh-body-sm)',
                        margin: 0,
                        marginBottom: 'var(--space-4)',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                      }}
                    >
                      {(() => {
                        const text = getCopy('mapa.programa.week1.learning.items')
                        const target = 'Neurociencia real de tu agotamiento mental.'
                        const idx = text.indexOf(target)
                        if (idx === -1) return text
                        return <>{text.slice(0, idx)}<mark style={{ background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)', margin: '-2px -6px', padding: '2px 6px', color: 'inherit' }}>{target}</mark>{text.slice(idx + target.length)}</>
                      })()}
                    </p>

                    {/* Protocolo + MNN + Sesión */}
                    {week1Items.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          marginBottom:
                            idx < 2
                              ? 'var(--space-3)'
                              : '0',
                          minWidth: 0,
                        }}
                      >
                        <p
                          style={{
                            fontFamily: 'var(--font-host-grotesk)',
                            fontSize: 'var(--text-body-sm)',
                            fontWeight: 600,
                            color: 'var(--color-text-primary)',
                            margin: 0,
                            lineHeight: 'var(--lh-body-sm)',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                          }}
                        >
                          {item.title}
                        </p>
                        <p
                          style={{
                            fontFamily: 'var(--font-host-grotesk)',
                            fontSize: 'var(--text-body-sm)',
                            fontWeight: 400,
                            color: 'var(--color-text-secondary)',
                            margin: 0,
                            marginTop: '4px',
                            lineHeight: 'var(--lh-body-sm)',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                          }}
                        >
                          {(() => {
                            const MARKER = { background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)', margin: '-2px -6px', padding: '2px 6px', color: 'inherit' } as React.CSSProperties
                            const targets = ['hasta una hora más de sueño al día', 'tu perfil de neurotransmisión']
                            let text = item.description
                            for (const t of targets) {
                              const idx = text.indexOf(t)
                              if (idx !== -1) {
                                return <>{text.slice(0, idx)}<mark style={MARKER}>{t}</mark>{text.slice(idx + t.length)}</>
                              }
                            }
                            return text
                          })()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ProgressiveUnlockModule moved to MapaClient — C5: entre dimensiones y programa */}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
