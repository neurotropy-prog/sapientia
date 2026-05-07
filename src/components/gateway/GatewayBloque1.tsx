'use client'

/**
 * GatewayBloque1 — P2 → Analizando → Primera Verdad → P3 → P4 → Micro-espejo 1
 *
 * A-04: Cross-fade entre pasos con changeStep (exit 200ms → enter 300ms).
 *       NUNCA corte seco entre preguntas.
 *
 * Al completar Micro-espejo 1, llama a onComplete con las respuestas
 * para que GatewayController pase al Bloque 2.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import ZoneWrapper, { getZoneBg } from './ZoneWrapper'
import AnalyzingScreen from './AnalyzingScreen'
import SingleSelectStep from './SingleSelectStep'
import MultiSelectStep from './MultiSelectStep'
import MicroEspejo from '@/components/ui/MicroEspejo'
import ProgressBar from '@/components/ui/ProgressBar'
import { useCopy } from '@/lib/copy'
import {
  getP1Options,
  getP2Options,
  getP3Options,
  getP4Options,
  getPrimeraVerdad,
  getMicroEspejo1,
  type MultiOption,
} from '@/lib/gateway-bloque1-data'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Step = 'p1' | 'p2' | 'analyzing' | 'primera-verdad' | 'p3' | 'p4' | 'micro-espejo-1'
type Zone = 'exploracion' | 'reflexion'

export interface Bloque1Answers {
  p1: string
  p2: string
  p3Selections: string[]
  p4: string
}

// Progreso no lineal — pausa en revelaciones (barra no avanza)
const PROGRESS: Record<Step, number> = {
  p1: 10,
  p2: 22,
  analyzing: 22,
  'primera-verdad': 22,    // PAUSE — bar stays at 22% during first truth
  p3: 38,
  p4: 48,
  'micro-espejo-1': 48,   // PAUSE — bar stays at 48% during micro-mirror 1
}

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface GatewayBloque1Props {
  onComplete: (answers: Bloque1Answers) => void
  onClose?: () => void
}

// ─── ESTILOS COMPARTIDOS ──────────────────────────────────────────────────────

const continueButtonStyle: React.CSSProperties = {
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
  transition: 'opacity var(--transition-fast), transform var(--transition-fast)',
  minHeight: '44px',
  marginTop: 'var(--space-2)',
}

const overlineStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontSize: 'var(--text-body-sm)',
  lineHeight: 'var(--lh-body-sm)',
  color: 'var(--color-text-tertiary)',
  letterSpacing: 'var(--ls-overline)',
  textTransform: 'uppercase',
  marginBottom: 'var(--space-4)',
}

// Mapa de paso anterior para navegación "Volver" dentro del bloque
const PREV_STEP: Partial<Record<Step, { step: Step; zone?: Zone }>> = {
  'primera-verdad': { step: 'p2', zone: 'exploracion' },
  p2: { step: 'p1' },
  p3: { step: 'p2' },
  'micro-espejo-1': { step: 'p4', zone: 'exploracion' },
  p4: { step: 'p3' },
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function GatewayBloque1({
  onComplete,
  onClose,
}: GatewayBloque1Props) {
  // ── Lock body scroll while gateway is open ──
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Copy overrides (admin-editable copy) ──
  const { getCopy } = useCopy()

  // ── Estado de pasos con cross-fade (A-04) ──
  const overlayRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('p1')
  const [stepKey, setStepKey] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  // ── Zona y respuestas ──
  const [zone, setZone] = useState<Zone>('exploracion')
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [p3Selections, setP3Selections] = useState<string[]>([])
  const [p4, setP4] = useState('')

  // ── changeStep: fade-out 200ms → nuevo paso con step-enter ──
  // A-04: exit 300ms + breath 100ms = 400ms before new step mounts
  const changeStep = useCallback((newStep: Step) => {
    setIsExiting(true)
    setTimeout(() => {
      setStep(newStep)
      setStepKey((k) => k + 1)
      setIsExiting(false)
      setTimeout(() => overlayRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 50)
    }, 400)
  }, [])

  // ── Volver: navega a la pregunta anterior o sale al hero ──
  const handleBack = useCallback(() => {
    const prev = PREV_STEP[step]
    if (!prev) {
      // P1 o paso sin anterior → volver al hero
      onClose?.()
      return
    }
    if (prev.zone) setZone(prev.zone)
    // Restaurar zona de exploración al volver a preguntas normales
    if (['p1', 'p2', 'p3', 'p4'].includes(prev.step)) setZone('exploracion')
    changeStep(prev.step)
  }, [step, onClose, changeStep])

  // ── Handlers ──
  const handleP1Select = useCallback(
    (id: string) => {
      setP1(id)
      changeStep('p2')
    },
    [changeStep]
  )

  const handleP2Select = useCallback(
    (id: string) => {
      setP2(id)
      setZone('reflexion')
      changeStep('analyzing')
    },
    [changeStep]
  )

  const handleAnalyzingComplete = useCallback(() => {
    changeStep('primera-verdad')
  }, [changeStep])

  const handlePrimeraVerdadContinue = useCallback(() => {
    setZone('exploracion')
    changeStep('p3')
  }, [changeStep])

  const handleP3Continue = useCallback(
    (selections: string[]) => {
      setP3Selections(selections)
      changeStep('p4')
    },
    [changeStep]
  )

  const handleP4Continue = useCallback(
    (selections: string[]) => {
      // Pick the most severe symptom (lowest P4 score) as primary for scoring/archetype
      const P4_SEVERITY: Record<string, number> = { A: 30, B: 20, C: 25, D: 15, E: 25, F: 75 }
      const primary = selections.reduce((worst, id) =>
        (P4_SEVERITY[id] ?? 99) < (P4_SEVERITY[worst] ?? 99) ? id : worst
      , selections[0])
      setP4(primary)
      setZone('reflexion')
      changeStep('micro-espejo-1')
    },
    [changeStep]
  )

  const handleMicroEspejo1Continue = useCallback(() => {
    onComplete({ p1, p2, p3Selections, p4 })
  }, [onComplete, p1, p2, p3Selections, p4])

  // ── Contenido calculado ──
  const primeraVerdad = getPrimeraVerdad(p1 || 'A', p2 || 'B', getCopy)
  const microEspejo1Content = getMicroEspejo1(p3Selections, p4 || 'A', getCopy)

  const progress = PROGRESS[step]
  const progressLabel = `Tu análisis: ${progress}% completo`

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={overlayRef}
      className="gateway-overlay"
      role="main"
      aria-label="Evaluación — Gateway L.A.R.S."
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
      {/* ── Barra de progreso sticky ── */}
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
            {(['p1', 'p2', 'primera-verdad', 'p3', 'p4', 'micro-espejo-1'] as Step[]).includes(step) && (
              <button
                onClick={handleBack}
                aria-label={step === 'p1' ? 'Volver a la landing' : 'Volver a la pregunta anterior'}
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

      {/* ── ZoneWrapper — fondo que cambia y respira ── */}
      <ZoneWrapper zone={zone}>
        {/*
          Cross-fade container (A-04):
          key={stepKey} → React remonta el elemento en cada cambio de paso
          className → step-exit mientras sale (200ms), step-enter cuando entra (350ms)
        */}
        <div
          key={stepKey}
          className={isExiting ? 'step-exit' : 'step-enter'}
        >
          {/* P1 — ¿Qué te trajo hasta aquí? (antes era la pregunta del hero) */}
          {step === 'p1' && (
            <SingleSelectStep
              question={getCopy('gateway.p1.question')}
              context={getCopy('gateway.p1.context')}
              options={getP1Options(getCopy)}
              onSelect={handleP1Select}
              defaultSelected={p1 || undefined}
            />
          )}

          {/* P2 */}
          {step === 'p2' && (
            <SingleSelectStep
              question="¿Cómo son tus noches últimamente?"
              context="Tu sueño es el indicador más fiable del estado de tu sistema nervioso."
              options={getP2Options(getCopy)}
              onSelect={handleP2Select}
              defaultSelected={p2 || undefined}
            />
          )}

          {/* Analizando... */}
          {step === 'analyzing' && (
            <AnalyzingScreen onComplete={handleAnalyzingComplete} />
          )}

          {/* Primera Verdad — stagger: label → observation → data → button */}
          {step === 'primera-verdad' && (
            <div>
              <p className="mirror-stagger-label" style={overlineStyle}>Lo que revelan tus respuestas</p>
              <MicroEspejo
                observation={primeraVerdad.text}
                collectiveData={primeraVerdad.collectiveData}
              />
              <button
                className="mirror-stagger-button"
                onClick={handlePrimeraVerdadContinue}
                style={continueButtonStyle}
              >
                Seguir con mi evaluación →
              </button>
              <div style={{ height: '60px' }} />
            </div>
          )}

          {/* P3 — Claridad cognitiva (selección múltiple) */}
          {step === 'p3' && (
            <MultiSelectStep
              question="¿Reconoces alguna de estas señales en tu día a día?"
              context={<>La gente que más necesita terminar este test es la que menos tiempo cree tener para hacerlo. Irónico, ¿verdad? <strong>Esa misma urgencia es el síntoma número uno.</strong></>}
              options={getP3Options(getCopy)}
              onContinue={handleP3Continue}
              defaultSelections={p3Selections.length > 0 ? p3Selections : undefined}
            />
          )}

          {/* P4 — Equilibrio emocional (multi-select) */}
          {step === 'p4' && (
            <MultiSelectStep
              question="¿Qué síntomas estás expresando de forma cotidiana?"
              context="Responde con sinceridad y sin culpa. Estás aquí porque eres consciente y buscas mejorar que es más de lo que la inmensa mayoría hace."
              options={getP4Options(getCopy) as MultiOption[]}
              onContinue={handleP4Continue}
            />
          )}

          {/* Micro-espejo 1 — stagger: label → observation → data → button */}
          {step === 'micro-espejo-1' && (
            <div>
              <p className="mirror-stagger-label" style={overlineStyle}>Tu patrón — 50% completado</p>
              <MicroEspejo
                observation={microEspejo1Content.text}
                collectiveData={microEspejo1Content.collectiveData}
              />
              <button
                className="mirror-stagger-button"
                onClick={handleMicroEspejo1Continue}
                style={continueButtonStyle}
              >
                Continuar la evaluación →
              </button>
              <div style={{ height: '60px' }} />
            </div>
          )}
        </div>
      </ZoneWrapper>
    </div>
  )
}
