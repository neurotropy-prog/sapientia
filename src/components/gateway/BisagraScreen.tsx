'use client'

/**
 * BisagraScreen — A-10
 *
 * Revelación secuencial del score. ZONA 3 — Revelación.
 * Cada elemento aparece con fade-in escalonado vía useEffect timers.
 *
 * Secuencia:
 *   T+0ms    step-enter (el contenedor ya visible)
 *   T+200ms  Overline "TU NIVEL DE REGULACIÓN"
 *   T+600ms  Counter score (0→score, 1200ms) + "de 100"
 *   T+2000ms Texto de comparación
 *   T+2400ms Counter benchmark (0→72, 800ms)
 *   T+3400ms Texto de brecha (accent)
 *   T+4000ms Separador + coste oculto
 *   T+5000ms Amplificador social
 *   T+5800ms Botón "Ver mi análisis completo"
 */

import { useState, useEffect } from 'react'
import Counter from '@/components/ui/Counter'
import type { DimensionScores } from '@/lib/scoring'

interface BisagraScreenProps {
  scores: DimensionScores
  onContinue: () => void
}

/** Fade-in con estado booleano */
function fadeStyle(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(12px)',
    transition: `opacity 500ms var(--ease-out-expo) ${delay}ms, transform 500ms var(--ease-out-expo) ${delay}ms`,
  }
}

export default function BisagraScreen({ scores, onContinue }: BisagraScreenProps) {
  const [showOverline, setShowOverline]     = useState(false)
  const [showScore, setShowScore]           = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [showGap, setShowGap]               = useState(false)
  const [showSocial, setShowSocial]         = useState(false)
  const [showButton, setShowButton]         = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setShowOverline(true),    200),
      setTimeout(() => setShowScore(true),        600),
      setTimeout(() => setShowComparison(true),  2000),
      setTimeout(() => setShowGap(true),         2800),
      setTimeout(() => setShowSocial(true),      3600),
      setTimeout(() => setShowButton(true),      4400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  /* prefers-reduced-motion: muestra todo inmediatamente */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setShowOverline(true)
      setShowScore(true)
      setShowComparison(true)
      setShowGap(true)
      setShowSocial(true)
      setShowButton(true)
    }
  }, [])

  return (
    <div
      className="step-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-5)',
      }}
    >
      {/* ── Card bisagra ── */}
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid rgba(38,66,51,0.18)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8) var(--space-6)',
        }}
      >
        {/* Overline */}
        <p
          style={{
            ...fadeStyle(showOverline),
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-caption)',
            letterSpacing: 'var(--ls-overline)',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-5)',
          }}
        >
          Tu nivel de regulación
        </p>

        {/* Score principal */}
        <div
          style={{
            ...fadeStyle(showScore),
            marginBottom: 'var(--space-2)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-display)',
              lineHeight: 1,
              letterSpacing: 'var(--ls-display)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
            }}
          >
            {showScore ? (
              <Counter
                from={0}
                to={scores.global}
                duration={1200}
              />
            ) : 0}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-h4)',
              lineHeight: 'var(--lh-h4)',
              color: 'var(--color-text-secondary)',
              marginLeft: 'var(--space-3)',
            }}
          >
            de 100
          </span>
        </div>

        {/* Separador */}
        <div
          style={{
            ...fadeStyle(showComparison),
            height: '1px',
            background: 'rgba(255,255,255,0.06)',
            margin: 'var(--space-6) 0',
          }}
        />

        {/* Título de contexto */}
        <p
          style={{
            ...fadeStyle(showComparison),
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--lh-body-sm)',
            letterSpacing: 'var(--ls-overline)',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Personas que empezaron en este rango:
        </p>

        {/* Dato principal con 69% destacado */}
        <p
          style={{
            ...fadeStyle(showGap),
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          El <strong style={{ color: 'var(--color-accent)', fontWeight: 700 }}>69%</strong> de
          las personas mejoraron un 12-18% sus niveles en las primeras 72 h. del programa
          e incrementaron {'>'} 35% sus resultados al completar el proceso de neuroregulación.
        </p>

        {/* Dato de urgencia */}
        <p
          style={{
            ...fadeStyle(showSocial),
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--lh-body-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Las que actuaron en la primera semana avanzaron un 34% más rápido que las que esperaron un mes.
        </p>
      </div>

      {/* Botón continuar */}
      <button
        onClick={onContinue}
        style={{
          ...fadeStyle(showButton),
          width: '100%',
          padding: 'var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(198,200,238,0.25)',
          background: 'transparent',
          color: 'var(--color-text-secondary)',
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          cursor: 'pointer',
          transition: 'color var(--transition-fast), border-color var(--transition-fast)',
          minHeight: '44px',
          pointerEvents: showButton ? 'auto' : 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)'
          e.currentTarget.style.borderColor = 'rgba(198,200,238,0.5)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-secondary)'
          e.currentTarget.style.borderColor = 'rgba(198,200,238,0.25)'
        }}
      >
        Ver mi análisis completo →
      </button>
    </div>
  )
}
