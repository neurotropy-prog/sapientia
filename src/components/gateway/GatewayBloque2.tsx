'use client'

/**
 * GatewayBloque2 — P5 → P6 → Micro-espejo 2 → P7 (sliders) → P8
 *
 * A-04: Cross-fade entre pasos (mismo patrón que GatewayBloque1).
 * A-07: Sliders con color dinámico en SlidersStep.
 * A-08: Micro-espejo 2 intensificado (fondo más oscuro, texto más grande, delay mayor).
 *
 * P6 — la más importante — tiene diseño visual reforzado (padding mayor, fuente más grande).
 *
 * Progreso: 60% → 70% → 75% (pausa) → 82% → 90%
 * Al completar P8, llama a onComplete con todas las respuestas del bloque.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import ZoneWrapper, { getZoneBg } from './ZoneWrapper'
import SingleSelectStep from './SingleSelectStep'
import SlidersStep from './SlidersStep'
import MicroEspejo from '@/components/ui/MicroEspejo'
import ProgressBar from '@/components/ui/ProgressBar'
import { useCopy } from '@/lib/copy'
import {
  P7_SLIDERS,
  getP5Options,
  getP6Options,
  getP8Options,
  getMicroEspejo2,
  type Bloque2Answers,
} from '@/lib/gateway-bloque2-data'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

type Step = 'p5' | 'p6' | 'micro-espejo-2' | 'p7' | 'p8'
type Zone = 'exploracion' | 'reflexion'

// Sprint 3: non-linear progress — micro-mirror 2 PAUSES at same % as P6
const PROGRESS: Record<Step, number> = {
  p5: 60,
  p6: 72,
  'micro-espejo-2': 72,   // PAUSE — bar stays at 72% during micro-mirror 2
  p7: 85,
  p8: 90,
}

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface GatewayBloque2Props {
  p1: string
  /** Respuestas de Bloque 1 — usadas para personalización de tono */
  p4: string
  onComplete: (answers: Bloque2Answers) => void
  onClose?: () => void
  /** Step to start at when returning from Bloque3 */
  initialStep?: Step
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
  transition: 'opacity var(--transition-fast)',
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
  p6: { step: 'p5' },
  'micro-espejo-2': { step: 'p6', zone: 'exploracion' },
  p7: { step: 'p6' },
  p8: { step: 'p7' },
}

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function GatewayBloque2({
  p4,
  onComplete,
  onClose,
  initialStep,
}: GatewayBloque2Props) {
  // ── Lock body scroll while gateway is open ──
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Copy overrides (admin-editable copy) ──
  const { getCopy } = useCopy()

  // ── Estado de pasos con cross-fade (A-04) ──
  const overlayRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>(initialStep ?? 'p5')
  const [stepKey, setStepKey] = useState(0)
  const [isExiting, setIsExiting] = useState(false)

  // ── Zona y respuestas ──
  const [zone, setZone] = useState<Zone>('exploracion')
  const [p5, setP5] = useState('')
  const [p6, setP6] = useState('')
  const [sliders, setSliders] = useState<Record<string, number | undefined>>({})
  const [p8, setP8] = useState('')

  // ── changeStep: cross-fade A-04 ──
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
      // P5 (primera pregunta del bloque) → volver al hero
      onClose?.()
      return
    }
    // Restaurar zona si se indica, o exploración al volver a preguntas normales
    if (prev.zone) setZone(prev.zone)
    else if (['p5', 'p6', 'p7', 'p8'].includes(prev.step)) setZone('exploracion')
    changeStep(prev.step)
  }, [step, onClose, changeStep])

  // ── Handlers ──
  const handleP5Select = useCallback(
    (id: string) => {
      setP5(id)
      changeStep('p6')
    },
    [changeStep]
  )

  const handleP6Select = useCallback(
    (id: string) => {
      setP6(id)
      setZone('reflexion')
      changeStep('micro-espejo-2')
    },
    [changeStep]
  )

  const handleMicroEspejo2Continue = useCallback(() => {
    setZone('exploracion')
    changeStep('p7')
  }, [changeStep])

  const handleP7Continue = useCallback(
    (values: Record<string, number>) => {
      setSliders(values)
      changeStep('p8')
    },
    [changeStep]
  )

  const handleP8Select = useCallback(
    (id: string) => {
      setP8(id)
      onComplete({ p5, p6, sliders, p8: id })
    },
    [onComplete, p5, p6, sliders]
  )

  // ── Contenido calculado ──
  const microEspejo2Content = getMicroEspejo2(p6 || 'A', getCopy)

  const progress = PROGRESS[step]
  const progressLabel = `Tu análisis: ${progress}% completo`

  // ── Ajuste de tono según P4 (personalización invisible) ──
  // Fuerte (P4=D): contexto más directo
  // Cuidador (P4=C): tono más suave
  // El copy base de P5/P6 no cambia — solo el contexto sutil
  const p5Context =
    p4 === 'D'
      ? 'El 41% de personas con tu perfil no recuerdan cuándo fue la última vez.'
      : p4 === 'C'
      ? 'No hay prisa. Tómate tu tiempo para responder.'
      : p4 === 'E'
      ? 'Basado en tu combinación anterior, esta dimensión es clave.'
      : 'El 41% de personas que hacen esta evaluación no recuerdan cuándo fue.'

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={overlayRef}
      className="gateway-overlay"
      role="main"
      aria-label="Evaluación — Gateway L.A.R.S. Bloque 2"
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
            {(['p5', 'p6', 'micro-espejo-2', 'p7', 'p8'] as Step[]).includes(step) && (
              <button
                onClick={handleBack}
                aria-label={step === 'p5' ? 'Volver a la landing' : 'Volver a la pregunta anterior'}
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

      {/* ── ZoneWrapper ── */}
      <ZoneWrapper zone={zone}>
        {/* Cross-fade container (A-04) */}
        <div
          key={stepKey}
          className={isExiting ? 'step-exit' : 'step-enter'}
        >
          {/* P5 — Alegría de vivir */}
          {step === 'p5' && (
            <SingleSelectStep
              question="¿Cuándo fue la última vez que disfrutaste algo de verdad — sin culpa, sin prisa, sin pensar en lo siguiente?"
              collectiveData={p5Context}
              options={getP5Options(getCopy)}
              onSelect={handleP5Select}
              defaultSelected={p5 || undefined}
            />
          )}

          {/* P6 — Frase identitaria (diseño reforzado) */}
          {step === 'p6' && (
            <div>
              {/* Overline que marca importancia */}
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-accent)',
                  letterSpacing: 'var(--ls-overline)',
                  textTransform: 'uppercase',
                  marginBottom: 'var(--space-4)',
                }}
              >
                La pregunta clave
              </p>
              <SingleSelectStep
                question="¿Cuál de estas frases sientes más verdadera ahora mismo?"
                collectiveData="Cada una de estas frases la ha elegido más de 1.000 personas antes que tú."
                options={getP6Options(getCopy)}
                reinforced
                onSelect={handleP6Select}
                defaultSelected={p6 || undefined}
              />
            </div>
          )}

          {/* Micro-espejo 2 — A-08: versión intensificada, stagger con delay largo */}
          {step === 'micro-espejo-2' && (
            <div>
              <p className="mirror-stagger-label" style={overlineStyle}>Tu patrón — 75% completado</p>
              <MicroEspejo
                observation={microEspejo2Content.text}
                collectiveData={microEspejo2Content.collectiveData}
                intensified
              />
              {/* Delay del botón: 3000ms (más largo que M1 para que la persona procese P6) */}
              <button
                className="mirror-stagger-button-intensified"
                onClick={handleMicroEspejo2Continue}
                style={continueButtonStyle}
              >
                Continuar la evaluación →
              </button>
              <div style={{ height: '60px' }} />
            </div>
          )}

          {/* P7 — Sliders A-07 */}
          {step === 'p7' && (
            <SlidersStep
              question="En una escala del 1 al 10, ¿cómo calificarías cada una de estas áreas?"
              sliders={P7_SLIDERS}
              onContinue={handleP7Continue}
              defaultValues={Object.keys(sliders).length > 0 ? sliders : undefined}
            />
          )}

          {/* P8 — Duración */}
          {step === 'p8' && (
            <SingleSelectStep
              question="¿Cuánto tiempo llevas sintiéndote así?"
              context="La duración importa: determina cómo responde tu cuerpo a la intervención."
              options={getP8Options(getCopy)}
              onSelect={handleP8Select}
              defaultSelected={p8 || undefined}
            />
          )}
        </div>
      </ZoneWrapper>
    </div>
  )
}
