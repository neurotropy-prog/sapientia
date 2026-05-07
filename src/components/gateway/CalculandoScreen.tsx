'use client'

/**
 * CalculandoScreen — A-09
 *
 * "Calculando tu perfil de regulación…" con TypeWriter (35ms/char).
 * Zona 3 — Revelación: fondo más oscuro y envolvente que ZONA 2.
 *
 * Timing:
 *   T+0ms    Aparece con step-enter sobre fondo oscuro máximo
 *   T+300ms  TypeWriter empieza (35ms/char × 32 chars ≈ 1120ms)
 *   T+1420ms Typing completo, cursor parpadea
 *   T+2220ms onComplete — GatewayBloque3 avanza a Bisagra
 *
 * prefers-reduced-motion: texto completo instantáneo, onComplete a 1200ms.
 */

import { useEffect } from 'react'
import TypeWriter from '@/components/ui/TypeWriter'

const CALCULANDO_TEXT = 'Calculando tu perfil de regulación\u2026'

interface CalculandoScreenProps {
  onComplete: () => void
}

export default function CalculandoScreen({ onComplete }: CalculandoScreenProps) {
  /* Fallback para prefers-reduced-motion */
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      const t = setTimeout(onComplete, 1200)
      return () => clearTimeout(t)
    }
  }, [onComplete])

  const handleTypingComplete = () => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!mq.matches) onComplete()
  }

  return (
    <div
      className="step-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-5)',
        background: 'var(--color-bg-primary)',
        padding: 'var(--space-16) var(--space-8)',
      }}
    >
      {/* Indicador de carga — pulso sutil */}
      <div
        aria-hidden="true"
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '2px solid rgba(38,66,51,0.08)',
          borderTopColor: 'var(--color-accent)',
          marginBottom: 'var(--space-4)',
          animation: 'spin 1s linear infinite',
        }}
      />

      <TypeWriter
        text={CALCULANDO_TEXT}
        speed={35}
        delay={300}
        onComplete={handleTypingComplete}
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
    </div>
  )
}
