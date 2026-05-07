'use client'

/**
 * ProgramaCompleto.tsx — Programa L.A.R.S.© de 12 semanas
 *
 * 3 fases con cabecera verde oscuro, 4 semanas cada una en tarjetas
 * con borde verde izquierdo, y bloque de resultados + métricas al final.
 */

import { useState, useRef, useEffect } from 'react'
import { useCopy } from '@/lib/copy'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface Week {
  number: number
  titleKey: string
  descriptionKey: string
}

interface Phase {
  id: number
  titleKey: string
  subtitleKey: string
  introKey: string
  resultsKey: string
  metricsKey: string
  weeks: Week[]
}

// ─── CONFIGURACIÓN DE FASES ──────────────────────────────────────────────────

const PHASES: Phase[] = [
  {
    id: 1,
    titleKey: 'mapa.aspiracional.fase1.title',
    subtitleKey: 'mapa.aspiracional.fase1.subtitle',
    introKey: 'mapa.programa.fase1.intro',
    resultsKey: 'mapa.programa.fase1.results',
    metricsKey: 'mapa.programa.fase1.metrics',
    weeks: [
      { number: 1, titleKey: 'mapa.programa.fase1.week1.title', descriptionKey: 'mapa.programa.fase1.week1.description' },
      { number: 2, titleKey: 'mapa.programa.fase1.week2.title', descriptionKey: 'mapa.programa.fase1.week2.description' },
      { number: 3, titleKey: 'mapa.programa.fase1.week3.title', descriptionKey: 'mapa.programa.fase1.week3.description' },
      { number: 4, titleKey: 'mapa.programa.fase1.week4.title', descriptionKey: 'mapa.programa.fase1.week4.description' },
    ],
  },
  {
    id: 2,
    titleKey: 'mapa.aspiracional.fase2.title',
    subtitleKey: 'mapa.aspiracional.fase2.subtitle',
    introKey: 'mapa.programa.fase2.intro',
    resultsKey: 'mapa.programa.fase2.results',
    metricsKey: 'mapa.programa.fase2.metrics',
    weeks: [
      { number: 5, titleKey: 'mapa.programa.fase2.week5.title', descriptionKey: 'mapa.programa.fase2.week5.description' },
      { number: 6, titleKey: 'mapa.programa.fase2.week6.title', descriptionKey: 'mapa.programa.fase2.week6.description' },
      { number: 7, titleKey: 'mapa.programa.fase2.week7.title', descriptionKey: 'mapa.programa.fase2.week7.description' },
      { number: 8, titleKey: 'mapa.programa.fase2.week8.title', descriptionKey: 'mapa.programa.fase2.week8.description' },
    ],
  },
  {
    id: 3,
    titleKey: 'mapa.aspiracional.fase3.title',
    subtitleKey: 'mapa.aspiracional.fase3.subtitle',
    introKey: 'mapa.programa.fase3.intro',
    resultsKey: 'mapa.programa.fase3.results',
    metricsKey: 'mapa.programa.fase3.metrics',
    weeks: [
      { number: 9, titleKey: 'mapa.programa.fase3.week9.title', descriptionKey: 'mapa.programa.fase3.week9.description' },
      { number: 10, titleKey: 'mapa.programa.fase3.week10.title', descriptionKey: 'mapa.programa.fase3.week10.description' },
      { number: 11, titleKey: 'mapa.programa.fase3.week11.title', descriptionKey: 'mapa.programa.fase3.week11.description' },
      { number: 12, titleKey: 'mapa.programa.fase3.week12.title', descriptionKey: 'mapa.programa.fase3.week12.description' },
    ],
  },
]

// ─── COLORES ──────────────────────────────────────────────────────────────────

const DARK_GREEN = '#2d4134'
const WEEK_BG = 'rgba(45, 65, 52, 0.06)'
const WEEK_BORDER = '#4a7c5c'
const ACCENT_LINE = '#4a9b6e'
const GOLDEN = '#edd274'
const CORAL = '#CD796C'

// ─── PHASE BLOCK ─────────────────────────────────────────────────────────────

function PhaseBlock({
  phase,
  getCopy,
}: {
  phase: Phase
  getCopy: (key: string) => string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      {/* ── Phase header (dark green) — clickable ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: DARK_GREEN,
          borderRadius: open ? '12px 12px 0 0' : '12px',
          padding: 'var(--space-5) var(--space-5)',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--space-3)',
          transition: 'border-radius 0.3s ease',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-plus-jakarta)',
              fontSize: 'var(--text-h4)',
              lineHeight: 'var(--lh-h4)',
              fontWeight: 700,
              color: '#ffffff',
              margin: 0,
              marginBottom: 'var(--space-2)',
            }}
          >
            {getCopy(phase.titleKey)}
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--lh-body-sm)',
              fontWeight: 600,
              color: GOLDEN,
              margin: 0,
            }}
          >
            {getCopy(phase.subtitleKey)}
          </p>
        </div>
        {/* Chevron */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={GOLDEN}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.3s ease',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ── Collapsible content ── */}
      <div
        style={{
          maxHeight: open ? '2000px' : '0',
          opacity: open ? 1 : 0,
          overflow: 'hidden',
          transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        }}
      >
        {/* ── Accent line separator ── */}
        <div style={{ height: 3, background: ACCENT_LINE }} />

        {/* ── Week cards ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) 0',
          }}
        >
          {phase.weeks.map((week) => (
            <div
              key={week.number}
              style={{
                background: WEEK_BG,
                borderLeft: `4px solid ${WEEK_BORDER}`,
                borderRadius: '0 12px 12px 0',
                padding: 'var(--space-4) var(--space-5)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  marginBottom: 'var(--space-1)',
                }}
              >
                SEMANA {week.number} — {getCopy(week.titleKey)}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 'var(--lh-body-sm)',
                  color: CORAL,
                  margin: 0,
                }}
              >
                {getCopy(week.descriptionKey).replace(/\.?$/, '.')}
              </p>
            </div>
          ))}
        </div>

        {/* ── Phase results ── */}
        <div
          style={{
            padding: '0 var(--space-2) var(--space-2)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--lh-body-sm)',
              color: 'var(--color-text-primary)',
              margin: 0,
              marginBottom: 'var(--space-2)',
            }}
          >
            <span style={{ color: CORAL, fontWeight: 600 }}>→</span>{' '}
            <strong>Al final de la Fase {phase.id}:</strong>{' '}
            {getCopy(phase.resultsKey)}
          </p>
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--lh-body-sm)',
              fontWeight: 600,
              color: CORAL,
              margin: 0,
            }}
          >
            {getCopy(phase.metricsKey)}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

interface ProgramaCompletoProps {
  hasPaid: boolean
}

export default function ProgramaCompleto({ hasPaid }: ProgramaCompletoProps) {
  const { getCopy } = useCopy()
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

  return (
    <>
      {/* Title — outside the card, large */}
      <h2
        style={{
          fontFamily: 'var(--font-plus-jakarta)',
          fontSize: 'var(--text-h2)',
          lineHeight: 'var(--lh-h2)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-5)',
          paddingLeft: 10,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
          transition:
            'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        Programa L.A.R.S.© Liderazgo de alto rendimiento sostenible
      </h2>

      <div
        ref={containerRef}
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
          transition:
            'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
        }}
      >
        {PHASES.map((phase) => (
          <PhaseBlock
            key={phase.id}
            phase={phase}
            getCopy={getCopy}
          />
        ))}
      </div>
    </>
  )
}
