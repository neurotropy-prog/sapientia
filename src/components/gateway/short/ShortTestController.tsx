'use client'

/**
 * ShortTestController — Orquesta el test corto de 4 preguntas + textarea.
 *
 * Flujo: P1 (ansiedad) → P2 (sueño) → P3 (fatiga) → P4 (estrés) → P5 (libre, opcional)
 *        → Email capture → /api/test-corto → pantalla de resultado con bucket.
 *
 * Reutiliza SingleSelectStep del LARS para las 4 primeras preguntas.
 * Mantiene el mismo look (CSS vars, transiciones, layout) que el gateway largo.
 */

import { useState, useCallback } from 'react'
import SingleSelectStep from '@/components/gateway/SingleSelectStep'
import {
  P1_QUESTION, P1_OPTIONS,
  P2_QUESTION, P2_OPTIONS,
  P3_QUESTION, P3_OPTIONS,
  P4_QUESTION, P4_OPTIONS,
  P5_QUESTION, P5_PLACEHOLDER, P5_MAX_LENGTH,
  classify,
  BUCKET_COPY,
  type ShortOption,
  type ShortTestAnswers,
  type BucketResult,
} from '@/lib/short-test-data'

type Phase = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'email' | 'result'

const STORAGE_KEY = 'neurobienestar_short_test'
const EXPIRATION_MS = 24 * 60 * 60 * 1000

interface SavedState {
  phase: Phase
  answers: Partial<ShortTestAnswers>
  savedAt: number
}

function loadSaved(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s: SavedState = JSON.parse(raw)
    if (Date.now() - s.savedAt > EXPIRATION_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return s
  } catch { return null }
}

function save(s: Omit<SavedState, 'savedAt'>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...s, savedAt: Date.now() })) }
  catch { /* no-op */ }
}

function clearSaved() {
  try { localStorage.removeItem(STORAGE_KEY) } catch { /* no-op */ }
}

function isEmailValid(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export default function ShortTestController() {
  const [restored] = useState(() => (typeof window !== 'undefined' ? loadSaved() : null))
  const [phase, setPhase] = useState<Phase>(restored?.phase ?? 'p1')
  const [answers, setAnswers] = useState<Partial<ShortTestAnswers>>(restored?.answers ?? {})
  const [openText, setOpenText] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<BucketResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const persist = useCallback((next: Partial<ShortTestAnswers>, nextPhase: Phase) => {
    setAnswers(next)
    setPhase(nextPhase)
    save({ phase: nextPhase, answers: next })
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 30)
  }, [])

  const handle = (key: keyof ShortTestAnswers, nextPhase: Phase) =>
    (id: string) => persist({ ...answers, [key]: id as ShortOption['id'] }, nextPhase)

  const submit = useCallback(async () => {
    if (!answers.p1 || !answers.p2 || !answers.p3 || !answers.p4) {
      setError('Faltan respuestas')
      return
    }
    if (!isEmailValid(email)) {
      setError('Email inválido')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        email: email.trim(),
        p1: answers.p1,
        p2: answers.p2,
        p3: answers.p3,
        p4: answers.p4,
        p5: openText.trim() || undefined,
      }
      const res = await fetch('/api/test-corto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        // Aún así clasificamos local para no dejar al usuario en blanco.
        setResult(classify(payload as ShortTestAnswers))
      } else {
        const data = await res.json()
        setResult(data.result ?? classify(payload as ShortTestAnswers))
      }
      clearSaved()
      setPhase('result')
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 30)
    } catch {
      setResult(classify({ ...answers, p5: openText } as ShortTestAnswers))
      clearSaved()
      setPhase('result')
    } finally {
      setSubmitting(false)
    }
  }, [answers, email, openText])

  // ── RENDER ────────────────────────────────────────────────────────────────

  if (phase === 'result' && result) {
    const copy = BUCKET_COPY[result.bucket]
    return (
      <div className="step-enter" style={pageWrap}>
        <div style={resultCard}>
          <p style={kicker}>Resultado</p>
          <h1 style={resultHeadline}>{copy.headline}</h1>
          <p style={resultBody}>{copy.body}</p>
          {result.secondary.length > 0 && (
            <p style={resultSecondary}>
              También has marcado señales fuertes en: {result.secondary.join(', ').replace('estres_cronico', 'estrés crónico')}.
            </p>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'p5') {
    return (
      <div className="step-enter" style={pageWrap}>
        <div style={cardWrap}>
          <h2 style={questionStyle}>{P5_QUESTION}</h2>
          <textarea
            value={openText}
            onChange={(e) => setOpenText(e.target.value.slice(0, P5_MAX_LENGTH))}
            placeholder={P5_PLACEHOLDER}
            maxLength={P5_MAX_LENGTH}
            rows={4}
            style={textareaStyle}
          />
          <div style={charCount}>{openText.length} / {P5_MAX_LENGTH}</div>
          <div style={btnRow}>
            <button style={btnPrimary} onClick={() => setPhase('email')}>
              Continuar
            </button>
            <button style={btnGhost} onClick={() => { setOpenText(''); setPhase('email') }}>
              Saltar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'email') {
    return (
      <div className="step-enter" style={pageWrap}>
        <div style={cardWrap}>
          <h2 style={questionStyle}>¿A qué email te enviamos tu resultado?</h2>
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          {error && <div style={errorStyle}>{error}</div>}
          <button
            style={{ ...btnPrimary, opacity: !isEmailValid(email) || submitting ? 0.5 : 1 }}
            disabled={!isEmailValid(email) || submitting}
            onClick={submit}
          >
            {submitting ? 'Enviando…' : 'Recibir mi resultado'}
          </button>
        </div>
      </div>
    )
  }

  // P1-P4: SingleSelectStep
  const stepProps = (() => {
    switch (phase) {
      case 'p1': return { question: P1_QUESTION, options: P1_OPTIONS, onSelect: handle('p1', 'p2'), defaultSelected: answers.p1 }
      case 'p2': return { question: P2_QUESTION, options: P2_OPTIONS, onSelect: handle('p2', 'p3'), defaultSelected: answers.p2 }
      case 'p3': return { question: P3_QUESTION, options: P3_OPTIONS, onSelect: handle('p3', 'p4'), defaultSelected: answers.p3 }
      case 'p4': return { question: P4_QUESTION, options: P4_OPTIONS, onSelect: handle('p4', 'p5'), defaultSelected: answers.p4 }
      default:   return null
    }
  })()

  if (!stepProps) return null

  return (
    <div className="step-enter" style={pageWrap}>
      <div style={progressWrap}>
        <span style={progressText}>
          Pregunta {phase.toUpperCase().slice(1)} de 4
        </span>
      </div>
      <SingleSelectStep {...stepProps} />
    </div>
  )
}

// ─── STYLES (siguen las CSS vars del LARS) ──────────────────────────────────

const pageWrap: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--space-6)',
  maxWidth: '640px',
  margin: '0 auto',
}

const progressWrap: React.CSSProperties = { marginBottom: 'var(--space-4)' }
const progressText: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  color: 'var(--color-text-secondary)',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
}

const cardWrap: React.CSSProperties = {
  background: 'var(--color-bg-secondary)',
  border: 'var(--border-subtle)',
  borderRadius: 'var(--radius-xl)',
  padding: 'var(--space-8)',
  width: '100%',
}

const kicker: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  color: 'var(--color-accent)',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-2)',
}

const questionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-h3)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-5)',
  lineHeight: 1.3,
}

const resultCard: React.CSSProperties = { ...cardWrap, textAlign: 'center' }

const resultHeadline: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-h1, 2rem)',
  fontWeight: 700,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-4)',
  lineHeight: 1.2,
}

const resultBody: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body)',
  color: 'var(--color-text-secondary)',
  lineHeight: 1.6,
  marginBottom: 'var(--space-4)',
}

const resultSecondary: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  color: 'var(--color-text-tertiary, var(--color-text-secondary))',
  marginTop: 'var(--space-3)',
}

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-lg)',
  border: 'var(--border-subtle)',
  background: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body)',
  resize: 'vertical',
}

const charCount: React.CSSProperties = {
  textAlign: 'right',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  color: 'var(--color-text-secondary)',
  marginTop: 'var(--space-2)',
  marginBottom: 'var(--space-4)',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3) var(--space-4)',
  borderRadius: 'var(--radius-pill)',
  border: 'var(--border-subtle)',
  background: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body)',
  marginBottom: 'var(--space-4)',
}

const btnRow: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-3)',
  flexWrap: 'wrap',
}

const btnPrimary: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-6)',
  borderRadius: 'var(--radius-pill)',
  border: 'none',
  background: 'var(--color-accent)',
  color: 'var(--color-text-inverse)',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body)',
  fontWeight: 500,
  cursor: 'pointer',
  minHeight: '44px',
}

const btnGhost: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-6)',
  borderRadius: 'var(--radius-pill)',
  border: 'var(--border-subtle)',
  background: 'transparent',
  color: 'var(--color-text-secondary)',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body)',
  cursor: 'pointer',
  minHeight: '44px',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  color: 'var(--color-error, #c0392b)',
  marginBottom: 'var(--space-3)',
}
