'use client'

/**
 * EvalSlider.tsx — Slider de autoevaluación (E1)
 *
 * Referencia visual: Barras_progreso.png (feedback Javi 01-abr-2026)
 *
 * Slider horizontal 1-10 con:
 * - Números 1 a 10 equidistantes debajo de la barra
 * - Handle: círculo blanco con sombra (arrastrable)
 * - Track: gris claro para pendiente, color para progreso realizado
 * - Valor actual mostrado en grande a la derecha del label
 */

import { useState, useCallback, useRef, useEffect } from 'react'

interface EvalSliderProps {
  label: string
  min?: number
  max?: number
  value: number
  onChange: (value: number) => void
  /** Color for the filled portion of the track */
  accentColor?: string
}

export default function EvalSlider({
  label,
  min = 1,
  max = 10,
  value,
  onChange,
  accentColor = 'var(--color-error)',
}: EvalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const steps = max - min + 1
  const pct = ((value - min) / (max - min)) * 100

  // Color based on value
  const fillColor = value <= 3 ? 'var(--color-error)' : value <= 6 ? 'var(--color-warning)' : 'var(--color-success)'

  const resolveValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const raw = min + ratio * (max - min)
      const snapped = Math.round(raw)
      onChange(Math.max(min, Math.min(max, snapped)))
    },
    [min, max, onChange],
  )

  // Pointer events for drag
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      resolveValue(e.clientX)
    },
    [resolveValue],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      resolveValue(e.clientX)
    },
    [isDragging, resolveValue],
  )

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Indicators array
  const indicators = Array.from({ length: steps }, (_, i) => min + i)

  return (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      {/* Label + value */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-4)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body)',
            fontWeight: 500,
            color: 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-plus-jakarta)',
            fontSize: 'var(--text-h3)',
            fontWeight: 700,
            color: fillColor,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          position: 'relative',
          height: '40px',
          cursor: 'pointer',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Background track */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(38, 66, 51, 0.08)',
          }}
        />

        {/* Filled track */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            height: '4px',
            borderRadius: '2px',
            width: `${pct}%`,
            background: fillColor,
            transition: isDragging ? 'none' : 'width 150ms ease',
          }}
        />

        {/* Tick marks */}
        {indicators.map((n) => {
          const tickPct = ((n - min) / (max - min)) * 100
          return (
            <div
              key={n}
              style={{
                position: 'absolute',
                left: `${tickPct}%`,
                width: '1px',
                height: '8px',
                background: 'rgba(38, 66, 51, 0.12)',
                transform: 'translateX(-0.5px)',
                top: 'calc(50% - 4px)',
              }}
            />
          )
        })}

        {/* Handle */}
        <div
          style={{
            position: 'absolute',
            left: `${pct}%`,
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#ffffff',
            boxShadow: isDragging
              ? '0 2px 8px rgba(0,0,0,0.2), 0 0 0 4px rgba(205,121,108,0.15)'
              : '0 2px 6px rgba(0,0,0,0.15)',
            transform: 'translate(-50%, 0)',
            transition: isDragging ? 'none' : 'left 150ms ease, box-shadow 200ms ease',
            zIndex: 2,
          }}
        />
      </div>

      {/* Number indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--space-1)',
          padding: '0 0px',
        }}
      >
        {indicators.map((n) => (
          <span
            key={n}
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-caption)',
              color: n === value ? fillColor : 'var(--color-text-tertiary)',
              fontWeight: n === value ? 600 : 400,
              width: `${100 / steps}%`,
              textAlign: 'center',
              transition: 'color 150ms ease',
            }}
          >
            {n}
          </span>
        ))}
      </div>
    </div>
  )
}
