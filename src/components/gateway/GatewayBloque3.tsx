'use client'

/**
 * GatewayBloque3 — Calculando → Bisagra → Email
 *
 * Gestiona la fase final del gateway:
 *   1. CalculandoScreen (A-09): Typing effect mientras se computa el score
 *   2. BisagraScreen (A-10): Revelación secuencial del score con counters
 *   3. EmailCapture (A-11): Mapa borroso + formulario de email
 *
 * El score se calcula ANTES de que CalculandoScreen empiece —
 * así la transición es instantánea cuando el typing termina.
 *
 * Progreso: 90% (bisagra) → 95% (email) — no lineal per spec.
 * Al completar email, llama onComplete(email).
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import BisagraSequence from './BisagraSequence'
import DefenseReveal from './DefenseReveal'
import EmailCapture from './EmailCapture'
import ProgressBar from '@/components/ui/ProgressBar'
import { computeScores } from '@/lib/scoring'
import { getArchetype } from '@/lib/content/archetypes'
import type { Bloque1Answers } from './GatewayBloque1'
import type { Bloque2Answers } from '@/lib/gateway-bloque2-data'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Step = 'bisagra' | 'archetype' | 'email'

const PROGRESS: Record<Step, number> = {
  bisagra: 90,
  archetype: 93,
  email: 95,
}

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface GatewayBloque3Props {
  p1: string
  bloque1: Bloque1Answers
  bloque2: Bloque2Answers
  onComplete: (email: string, whatsapp?: string) => void
  onClose?: () => void
  onBack?: () => void
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function GatewayBloque3({
  p1,
  bloque1,
  bloque2,
  onComplete,
  onClose,
  onBack,
}: GatewayBloque3Props) {
  // ── Lock body scroll while gateway is open ──
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const overlayRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('bisagra')
  const [stepKey, setStepKey] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  /* Score calculado una sola vez al montar — antes del typing */
  const [scores] = useState(() => computeScores(p1, bloque1, bloque2))

  /* Archetype calculado una sola vez — p6 de bloque2, p4 y p2 de bloque1 */
  const [archetype] = useState(() => getArchetype(bloque2.p6, bloque1.p4, bloque1.p2))

  /* cross-fade A-04 */
  const changeStep = useCallback((newStep: Step) => {
    setIsExiting(true)
    setTimeout(() => {
      setStep(newStep)
      setStepKey((k) => k + 1)
      setIsExiting(false)
      setTimeout(() => overlayRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
    }, 400)
  }, [])

  const handleBisagraContinue = useCallback(() => {
    changeStep('archetype')
  }, [changeStep])

  const handleArchetypeContinue = useCallback(() => {
    changeStep('email')
  }, [changeStep])

  const handleEmailComplete = useCallback(
    (email: string, whatsapp?: string) => {
      onComplete(email, whatsapp)
    },
    [onComplete]
  )

  /* ── Back navigation within Bloque3 (fix G1: Volver no funcionaba en email 95%) ── */
  const PREV_STEP: Partial<Record<Step, Step>> = {
    archetype: 'bisagra',
    email: 'archetype',
  }

  const handleBack = useCallback(() => {
    const prev = PREV_STEP[step]
    if (!prev) {
      // bisagra (first step) → volver al bloque anterior
      if (onBack) {
        onBack()
      } else {
        onClose?.()
      }
      return
    }
    changeStep(prev)
  }, [step, onBack, onClose, changeStep])

  const progress = PROGRESS[step]
  const progressLabel = `Tu análisis: ${progress}% completo`

  return (
    <div
      ref={overlayRef}
      className="gateway-overlay"
      role="main"
      aria-label="Evaluación — Gateway L.A.R.S. Bloque 3"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: 'var(--bg-reveal-solid)', /* ZONA 3 — color sólido */
      }}
    >
      {/* ── Barra de progreso sticky ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: 'var(--bg-reveal-solid)', /* Solid for sticky header */
          transition: 'background-color 800ms var(--ease-zone)',
          padding: 'var(--space-4) var(--container-padding-mobile)',
          paddingBottom: 'var(--space-3)',
          borderBottom: 'var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          {/* Título del test + Volver */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-3)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 500,
                color: '#CD796C',
                margin: 0,
              }}
            >
              Mapa actual de tu sistema nervioso (MASS©)
            </p>
            {(onClose || PREV_STEP[step]) && (
              <button
                onClick={handleBack}
                aria-label={PREV_STEP[step] ? 'Volver a la pantalla anterior' : 'Volver a la landing'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                  fontSize: 'var(--text-body-sm)',
                  fontFamily: 'var(--font-host-grotesk)',
                  transition: 'color var(--transition-fast)',
                  flexShrink: 0,
                }}
              >
                ← Volver
              </button>
            )}
          </div>
          <ProgressBar value={progress} label={progressLabel} barColor="linear-gradient(90deg, #2b5f3d, #2d4134)" />
        </div>
      </div>

      {/* ── Contenido — sin ZoneWrapper, ZONA 3 gestiona su propio fondo ── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: step === 'bisagra' ? 'center' : 'flex-start',
          padding: 'var(--space-8) var(--container-padding-mobile)',
        }}
      >
        <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%' }}>
          <div
            key={stepKey}
            className={isExiting ? 'step-exit' : 'step-enter'}
          >
            {step === 'bisagra' && (
              <BisagraSequence scores={scores} onContinue={handleBisagraContinue} />
            )}
            {step === 'archetype' && (
              <DefenseReveal archetype={archetype} onContinue={handleArchetypeContinue} />
            )}
            {step === 'email' && (
              <EmailCapture scores={scores} onComplete={handleEmailComplete} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
