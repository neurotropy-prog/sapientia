'use client'

/**
 * CompressedBisagra — Bisagra rápida para flujo CONVERT (90s)
 *
 * Solo muestra: "Tu resultado: {score}" vs "Media colectiva: 72"
 * Sin coste oculto, sin amplificador social.
 * Timing más rápido que BisagraScreen completa.
 */

import { useState, useEffect } from 'react'
import Counter from '@/components/ui/Counter'
import type { DimensionScores } from '@/lib/scoring'

interface CompressedBisagraProps {
  scores: DimensionScores
  onContinue: () => void
}

export default function CompressedBisagra({ scores, onContinue }: CompressedBisagraProps) {
  const [showOverline, setShowOverline] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowOverline(true), 200),
      setTimeout(() => setShowScore(true), 500),
      setTimeout(() => setShowComparison(true), 1700),
      setTimeout(() => setShowButton(true), 2800),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Overline */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-caption)',
          letterSpacing: 'var(--ls-overline)',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-6)',
          opacity: showOverline ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}
      >
        Tu nivel de regulación
      </p>

      {/* Score con counter */}
      <div
        style={{
          opacity: showScore ? 1 : 0,
          transition: 'opacity 400ms ease',
          marginBottom: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 'var(--space-2)' }}>
          {showScore && (
            <span style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-display)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 1,
            }}>
              <Counter from={0} to={scores.global} duration={800} />
            </span>
          )}
          <span style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-h4)',
            fontWeight: 400,
            color: 'var(--color-text-secondary)',
          }}>
            de 100
          </span>
        </div>
      </div>

      {/* Contexto de personas en este rango */}
      <div
        style={{
          opacity: showComparison ? 1 : 0,
          transform: showComparison ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 400ms ease',
          marginBottom: 'var(--space-8)',
          textAlign: 'left',
        }}
      >
        <p style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          lineHeight: 'var(--lh-body-sm)',
          color: 'var(--color-text-secondary)',
        }}>
          El <strong style={{ color: 'var(--color-accent)', fontWeight: 700 }}>69%</strong> de
          las personas mejoraron un 12-18% sus niveles en las primeras 72 h. del programa.
        </p>
      </div>

      {/* Botón */}
      <button
        onClick={onContinue}
        style={{
          width: '100%',
          padding: 'var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-pill)',
          border: 'none',
          background: 'var(--color-accent)',
          color: 'var(--color-text-inverse)',
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 500,
          cursor: 'pointer',
          minHeight: '44px',
          opacity: showButton ? 1 : 0,
          transition: 'opacity 400ms ease',
        }}
      >
        Ver mi evaluación completa
      </button>
    </div>
  )
}
