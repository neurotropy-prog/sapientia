'use client'

/**
 * ShortTestController — Test corto de 4 preguntas + textarea + email.
 *
 * Replica el chrome del LARS GatewayBloque1:
 *   - Sticky header con título de sección + Volver + ProgressBar
 *   - ZoneWrapper con fondo que respira al cambiar de fase
 *   - Cross-fade entre pasos (step-enter / step-exit)
 *   - SingleSelectStep para P1-P4
 *
 * Flujo: P1 ansiedad → P2 sueño → P3 fatiga → P4 estrés → P5 textarea (opcional)
 *        → email → /api/test-corto → pantalla de resultado con bucket.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import ZoneWrapper, { getZoneBg } from '@/components/gateway/ZoneWrapper'
import SingleSelectStep from '@/components/gateway/SingleSelectStep'
import ProgressBar from '@/components/ui/ProgressBar'
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
type Zone = 'exploracion' | 'reflexion' | 'revelacion'

const PROGRESS: Record<Phase, number> = {
  p1: 15,
  p2: 32,
  p3: 50,
  p4: 68,
  p5: 80,
  email: 92,
  result: 100,
}

const ZONE_BY_PHASE: Record<Phase, Zone> = {
  p1: 'exploracion',
  p2: 'exploracion',
  p3: 'exploracion',
  p4: 'exploracion',
  p5: 'reflexion',
  email: 'reflexion',
  result: 'revelacion',
}

const PREV_PHASE: Partial<Record<Phase, Phase>> = {
  p2: 'p1',
  p3: 'p2',
  p4: 'p3',
  p5: 'p4',
  email: 'p5',
}

const STORAGE_KEY = 'neurobienestar_short_test'
const EXPIRATION_MS = 24 * 60 * 60 * 1000

interface SavedState {
  phase: Phase
  answers: Partial<ShortTestAnswers>
  openText: string
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
  const overlayRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>(restored?.phase ?? 'p1')
  const [phaseKey, setPhaseKey] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [answers, setAnswers] = useState<Partial<ShortTestAnswers>>(restored?.answers ?? {})
  const [openText, setOpenText] = useState(restored?.openText ?? '')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<BucketResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Lock scroll mientras el test está activo (igual que LARS GatewayBloque1)
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const changePhase = useCallback((next: Phase, nextAnswers?: Partial<ShortTestAnswers>, nextOpenText?: string) => {
    setIsExiting(true)
    setTimeout(() => {
      const a = nextAnswers ?? answers
      const o = nextOpenText ?? openText
      if (nextAnswers) setAnswers(a)
      if (nextOpenText !== undefined) setOpenText(o)
      setPhase(next)
      setPhaseKey(k => k + 1)
      setIsExiting(false)
      if (next !== 'result') save({ phase: next, answers: a, openText: o })
      setTimeout(() => overlayRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
    }, 400)
  }, [answers, openText])

  const handleBack = useCallback(() => {
    const prev = PREV_PHASE[phase]
    if (prev) changePhase(prev)
  }, [phase, changePhase])

  const handleSelect = (key: keyof ShortTestAnswers, next: Phase) =>
    (id: string) => changePhase(next, { ...answers, [key]: id as ShortOption['id'] })

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
    const payload = {
      email: email.trim(),
      p1: answers.p1, p2: answers.p2, p3: answers.p3, p4: answers.p4,
      p5: openText.trim() || undefined,
    }
    let computed: BucketResult
    try {
      const res = await fetch('/api/test-corto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const data = await res.json()
        computed = data.result ?? classify(payload as ShortTestAnswers)
      } else {
        computed = classify(payload as ShortTestAnswers)
      }
    } catch {
      computed = classify(payload as ShortTestAnswers)
    }
    setResult(computed)
    clearSaved()
    setSubmitting(false)
    changePhase('result')
  }, [answers, email, openText, changePhase])

  const zone = ZONE_BY_PHASE[phase]
  const progress = PROGRESS[phase]
  const progressLabel = `Tu análisis: ${progress}% completo`

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={overlayRef}
      className="gateway-overlay"
      role="main"
      aria-label="Test corto de neurorregulación"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: getZoneBg(zone),
        transition: 'background-color 600ms var(--ease-zone)',
      }}
    >
      {/* ── Sticky header: título de sección + Volver + ProgressBar ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backgroundColor: getZoneBg(zone),
          transition: 'background-color 600ms var(--ease-zone)',
          padding: 'var(--space-4) var(--container-padding-mobile)',
          paddingBottom: 'var(--space-3)',
          borderBottom: 'var(--border-subtle)',
        }}
      >
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-3)',
              gap: 'var(--space-3)',
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
              Mapa rápido de neurorregulación
            </p>
            {PREV_PHASE[phase] && phase !== 'result' && (
              <button
                onClick={handleBack}
                aria-label="Volver a la pregunta anterior"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                  fontSize: 'var(--text-body-sm)',
                  fontFamily: 'var(--font-host-grotesk)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
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

      {/* ── ZoneWrapper — fondo respira en cada cambio de fase ── */}
      <ZoneWrapper zone={zone}>
        <div
          key={phaseKey}
          className={isExiting ? 'step-exit' : 'step-enter'}
        >
          {phase === 'p1' && (
            <SingleSelectStep
              question={P1_QUESTION}
              options={P1_OPTIONS}
              onSelect={handleSelect('p1', 'p2')}
              defaultSelected={answers.p1 || undefined}
            />
          )}

          {phase === 'p2' && (
            <SingleSelectStep
              question={P2_QUESTION}
              context="Tu sueño es el indicador más fiable del estado de tu sistema nervioso."
              options={P2_OPTIONS}
              onSelect={handleSelect('p2', 'p3')}
              defaultSelected={answers.p2 || undefined}
            />
          )}

          {phase === 'p3' && (
            <SingleSelectStep
              question={P3_QUESTION}
              options={P3_OPTIONS}
              onSelect={handleSelect('p3', 'p4')}
              defaultSelected={answers.p3 || undefined}
            />
          )}

          {phase === 'p4' && (
            <SingleSelectStep
              question={P4_QUESTION}
              options={P4_OPTIONS}
              onSelect={handleSelect('p4', 'p5')}
              defaultSelected={answers.p4 || undefined}
            />
          )}

          {phase === 'p5' && (
            <FreeTextStep
              value={openText}
              onChange={setOpenText}
              onContinue={() => changePhase('email')}
              onSkip={() => { setOpenText(''); changePhase('email') }}
            />
          )}

          {phase === 'email' && (
            <EmailStep
              email={email}
              onChange={setEmail}
              error={error}
              submitting={submitting}
              onSubmit={submit}
            />
          )}

          {phase === 'result' && result && (
            <ResultStep result={result} />
          )}
        </div>
      </ZoneWrapper>
    </div>
  )
}

// ─── SUB-PASOS ───────────────────────────────────────────────────────────────

function FreeTextStep({
  value, onChange, onContinue, onSkip,
}: { value: string; onChange: (v: string) => void; onContinue: () => void; onSkip: () => void }) {
  return (
    <div>
      <h2 style={questionHeading}>{P5_QUESTION}</h2>
      <p style={contextText}>Tres líneas son suficientes. Si no quieres añadir nada, salta este paso.</p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, P5_MAX_LENGTH))}
        placeholder={P5_PLACEHOLDER}
        maxLength={P5_MAX_LENGTH}
        rows={5}
        style={textareaStyle}
      />
      <div style={charCount}>{value.length} / {P5_MAX_LENGTH}</div>
      <button onClick={onContinue} style={continueButton}>
        Continuar →
      </button>
      <button onClick={onSkip} style={skipButton}>
        Saltar este paso
      </button>
      <div style={{ height: '60px' }} />
    </div>
  )
}

function EmailStep({
  email, onChange, error, submitting, onSubmit,
}: { email: string; onChange: (v: string) => void; error: string | null; submitting: boolean; onSubmit: () => void }) {
  const valid = isEmailValid(email)
  return (
    <div>
      <h2 style={questionHeading}>¿A qué email te enviamos tu resultado?</h2>
      <p style={contextText}>Vas a recibir el primer paso del protocolo en cuestión de minutos.</p>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="tu@email.com"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
      {error && <div style={errorStyle}>{error}</div>}
      <button
        style={{ ...continueButton, opacity: !valid || submitting ? 0.5 : 1 }}
        disabled={!valid || submitting}
        onClick={onSubmit}
      >
        {submitting ? 'Enviando…' : 'Recibir mi resultado'}
      </button>
      <div style={{ height: '60px' }} />
    </div>
  )
}

function ResultStep({ result }: { result: BucketResult }) {
  const copy = BUCKET_COPY[result.bucket]
  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontSize: 'var(--text-body-sm)',
        color: '#CD796C',
        letterSpacing: 'var(--ls-overline)',
        textTransform: 'uppercase',
        marginBottom: 'var(--space-3)',
      }}>
        Tu resultado
      </p>
      <h1 style={resultHeadline}>{copy.headline}</h1>
      <p style={resultBody}>{copy.body}</p>
      {result.secondary.length > 0 && (
        <p style={resultSecondary}>
          También has marcado señales fuertes en: {result.secondary.map(s => s.replace('estres_cronico', 'estrés crónico')).join(', ')}.
        </p>
      )}
      <div style={{ height: '60px' }} />
    </div>
  )
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const questionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-h3)',
  fontWeight: 600,
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--space-3)',
  lineHeight: 1.3,
}

const contextText: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body)',
  color: 'var(--color-text-secondary)',
  marginBottom: 'var(--space-5)',
  lineHeight: 'var(--lh-body)',
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
  boxSizing: 'border-box',
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
  borderRadius: 'var(--radius-lg)',
  border: 'var(--border-subtle)',
  background: 'var(--color-bg-primary)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body)',
  marginBottom: 'var(--space-4)',
  boxSizing: 'border-box',
}

const continueButton: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-4) var(--space-6)',
  borderRadius: 'var(--radius-lg)',
  border: 'none',
  background: '#314135',
  color: '#ffffff',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'opacity var(--transition-fast)',
  minHeight: '44px',
  marginTop: 'var(--space-2)',
}

const skipButton: React.CSSProperties = {
  width: '100%',
  padding: 'var(--space-3) var(--space-6)',
  borderRadius: 'var(--radius-lg)',
  border: 'none',
  background: 'transparent',
  color: 'var(--color-text-tertiary)',
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  cursor: 'pointer',
  marginTop: 'var(--space-2)',
}

const errorStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  color: 'var(--color-error, #c0392b)',
  marginBottom: 'var(--space-3)',
}

const resultHeadline: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-h2, 1.75rem)',
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
