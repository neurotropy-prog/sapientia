'use client'

/**
 * BisagraSequence — A-09 + A-10 unified
 *
 * FASE 1 — Preloader segmentado circular (sin caja)
 *   Inspirado en referencia: segmentos radiales con gradiente verde LARS,
 *   círculo central con texto de progreso, animación de barrido.
 *
 * FASE 2 — Reveal dentro de bisagra-box
 */

import { useState, useEffect, useRef } from 'react'
import Counter from '@/components/ui/Counter'
import TypeWriter from '@/components/ui/TypeWriter'
import type { DimensionScores } from '@/lib/scoring'

const CALCULANDO_TEXT = 'Calculando tu perfil de regulación\u2026'

// ─── PRELOADER SEGMENTADO ─────────────────────────────────────────────────────

const NUM_SEGMENTS = 24
const SIZE = 260
const CX = SIZE / 2
const CY = SIZE / 2
const OUTER_R = 112
const INNER_R = 78
const GAP_DEG = 3          // hueco entre segmentos
const SEG_DEG = (360 - NUM_SEGMENTS * GAP_DEG) / NUM_SEGMENTS

// Colores planos — sin degradado
const SEG_LIT = '#3b6a48'       // verde LARS encendido
const SEG_OFF = 'rgba(45,65,52,0.08)' // apagado

/** Genera el path de un segmento de arco (sector entre innerR y outerR) */
function arcSegmentPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startDeg: number, endDeg: number,
): string {
  const toRad = (d: number) => ((d - 90) * Math.PI) / 180
  const cos = Math.cos, sin = Math.sin

  const s = toRad(startDeg)
  const e = toRad(endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0

  const ox1 = cx + outerR * cos(s)
  const oy1 = cy + outerR * sin(s)
  const ox2 = cx + outerR * cos(e)
  const oy2 = cy + outerR * sin(e)
  const ix1 = cx + innerR * cos(e)
  const iy1 = cy + innerR * sin(e)
  const ix2 = cx + innerR * cos(s)
  const iy2 = cy + innerR * sin(s)

  return [
    `M ${ox1} ${oy1}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${ox2} ${oy2}`,
    `L ${ix1} ${iy1}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2}`,
    'Z',
  ].join(' ')
}

function SegmentedPreloader({ visible, progress }: { visible: boolean; progress: number }) {
  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.92)',
        transition: 'opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
      >
        {/* Segments — flat, no filters */}
        {Array.from({ length: NUM_SEGMENTS }, (_, i) => {
          const startAngle = i * (SEG_DEG + GAP_DEG)
          const endAngle = startAngle + SEG_DEG
          const litCount = Math.round((progress / 100) * NUM_SEGMENTS)
          const isLit = i < litCount

          return (
            <path
              key={i}
              d={arcSegmentPath(CX, CY, INNER_R, OUTER_R, startAngle, endAngle)}
              fill={isLit ? SEG_LIT : SEG_OFF}
              style={{
                transition: 'fill 300ms ease',
                animation: visible
                  ? `bisagra-seg-in 350ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 35}ms both`
                  : undefined,
              }}
            />
          )
        })}

        {/* Center circle — flat */}
        <circle
          cx={CX}
          cy={CY}
          r={INNER_R - 6}
          fill="var(--color-bg-secondary, #f5f2ef)"
        />

        {/* Progress text */}
        <text
          x={CX}
          y={CY - 6}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: 'var(--font-host-grotesk, system-ui)',
            fontSize: '38px',
            fontWeight: 700,
            fill: '#2d4134',
          }}
        >
          {progress}%
        </text>
        <text
          x={CX}
          y={CY + 22}
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fontFamily: 'var(--font-host-grotesk, system-ui)',
            fontSize: '11px',
            fontWeight: 500,
            fill: 'var(--color-text-tertiary, #8a8a8a)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
          }}
        >
          progreso
        </text>
      </svg>
    </div>
  )
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getSeverity(score: number): { label: string; color: string } {
  if (score < 30) return { label: 'CRÍTICO', color: '#C44040' }
  if (score <= 50) return { label: 'MODERADO', color: '#edd274' }
  return { label: 'EN RANGO', color: '#3D9A5F' }
}

function fadeStyle(visible: boolean, delay = 0): React.CSSProperties {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'none' : 'translateY(12px)',
    transition: `opacity 500ms var(--ease-out-expo) ${delay}ms, transform 500ms var(--ease-out-expo) ${delay}ms`,
  }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export default function BisagraSequence({ scores, onContinue }: { scores: DimensionScores; onContinue: () => void }) {
  // ── State ──
  const [showPreloader, setShowPreloader] = useState(false)
  const [progress, setProgress]           = useState(0)
  const [showTyping, setShowTyping]       = useState(false)
  const [fadeCalc, setFadeCalc]           = useState(false)
  const [showBox, setShowBox]             = useState(false)
  const [showLabel, setShowLabel]         = useState(false)
  const [showScore, setShowScore]         = useState(false)
  const [showSeverity, setShowSeverity]   = useState(false)
  const [showBenchmark, setShowBenchmark] = useState(false)
  const [showGap, setShowGap]             = useState(false)
  const [showSocial, setShowSocial]       = useState(false)
  const [showButton, setShowButton]       = useState(false)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Animated progress counter ──
  useEffect(() => {
    if (!showPreloader) return
    let current = 0
    progressRef.current = setInterval(() => {
      // Easing: faster at start, slower near end
      const step = current < 60 ? 3 : current < 85 ? 2 : 1
      current = Math.min(current + step, 90)
      setProgress(current)
      if (current >= 90 && progressRef.current) {
        clearInterval(progressRef.current)
      }
    }, 100)
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [showPreloader])

  // ── Orchestration ──
  useEffect(() => {
    const timers = [
      // FASE 1 — Preloader segmentado
      setTimeout(() => setShowPreloader(true), 600),
      setTimeout(() => setShowTyping(true), 1000),
      // T=4.0s → fade out
      setTimeout(() => setFadeCalc(true), 4000),
      // FASE 2 — Reveal
      setTimeout(() => setShowBox(true), 4400),
      setTimeout(() => setShowLabel(true), 4600),
      setTimeout(() => setShowScore(true), 5000),
      setTimeout(() => setShowSeverity(true), 6200),
      setTimeout(() => setShowBenchmark(true), 7700),
      setTimeout(() => setShowGap(true), 8700),
      setTimeout(() => setShowSocial(true), 9200),
      setTimeout(() => setShowButton(true), 9700),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // ── prefers-reduced-motion ──
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      setFadeCalc(true)
      setShowBox(true)
      setShowLabel(true)
      setShowScore(true)
      setShowSeverity(true)
      setShowBenchmark(true)
      setShowGap(true)
      setShowSocial(true)
      setShowButton(true)
    }
  }, [])

  const severity = getSeverity(scores.global)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: 'var(--space-5)',
        paddingBottom: '100px',
      }}
    >
      {/* ═══ FASE 1: Preloader segmentado — SIN caja ═══ */}
      <div
        style={{
          position: fadeCalc ? 'absolute' : 'relative',
          opacity: fadeCalc ? 0 : 1,
          transform: fadeCalc ? 'scale(0.95)' : 'scale(1)',
          transition: 'opacity 400ms ease, transform 400ms ease',
          pointerEvents: fadeCalc ? 'none' : 'auto',
          width: fadeCalc ? 0 : 'auto',
          height: fadeCalc ? 0 : 'auto',
          overflow: fadeCalc ? 'hidden' : 'visible',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        <SegmentedPreloader visible={showPreloader} progress={progress} />

        {showTyping && (
          <TypeWriter
            text={CALCULANDO_TEXT}
            speed={35}
            delay={0}
            cursorPostDelay={1000}
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--color-text-secondary)',
              fontStyle: 'italic',
              textAlign: 'center',
              display: 'block',
              minHeight: '1.6em',
            }}
          />
        )}
      </div>

      {/* ═══ FASE 2: Reveal — dentro de bisagra-box ═══ */}
      <div
        className="bisagra-box"
        style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid rgba(38,66,51,0.18)',
          borderRadius: '16px',
          padding: '48px 32px',
          maxWidth: '520px',
          width: '100%',
          opacity: showBox ? 1 : 0,
          transform: showBox ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 400ms var(--ease-out-expo), transform 400ms var(--ease-out-expo)',
          display: fadeCalc ? 'block' : 'none',
          overflow: 'hidden',
        }}
      >
        {/* Overline */}
        <p
          style={{
            ...fadeStyle(showLabel),
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-caption)',
            letterSpacing: 'var(--ls-overline)',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-3)',
          }}
        >
          TU NIVEL DE NEUROREGULACIÓN
        </p>

        {/* Score + "de 100" + severity */}
        <div
          style={{
            ...fadeStyle(showScore),
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'baseline',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: '4rem',
              lineHeight: 1,
              letterSpacing: 'var(--ls-display)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            {showScore ? (
              <Counter from={0} to={scores.global} duration={1200} autoStart />
            ) : '0'}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-h4)',
              lineHeight: 'var(--lh-h4)',
              color: 'var(--color-text-secondary)',
            }}
          >
            de 100
          </span>
          <span
            style={{
              ...fadeStyle(showSeverity),
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-h4)',
              fontWeight: 700,
              color: severity.color,
            }}
          >
            — {severity.label}
          </span>
        </div>

        {/* Separator */}
        <div
          style={{
            ...fadeStyle(showBenchmark),
            height: '1px',
            background: 'rgba(38,66,51,0.18)',
            margin: '0 0 var(--space-5)',
          }}
        />

        {/* Benchmark title */}
        <p
          style={{
            ...fadeStyle(showBenchmark),
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

        {/* Main stat */}
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
          El <strong style={{ color: 'var(--color-text-primary)', fontWeight: 700 }}>69%</strong> de
          las personas mejoraron un 12-18% sus niveles en las primeras 72&nbsp;h. del programa
          e incrementaron {'>'}35% sus resultados al completar el proceso de neuroregulación.
        </p>

        {/* Urgency stat */}
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

      {/* ── CTA Button ── */}
      <button
        onClick={onContinue}
        style={{
          ...fadeStyle(showButton),
          width: '100%',
          maxWidth: '520px',
          padding: 'var(--space-4) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          border: 'none',
          background: '#CD796C',
          color: '#ffffff',
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'opacity var(--transition-fast)',
          minHeight: '44px',
          pointerEvents: showButton ? 'auto' : 'none',
          marginBottom: '30px',
        }}
      >
        Ver mi evaluación completa →
      </button>
    </div>
  )
}
