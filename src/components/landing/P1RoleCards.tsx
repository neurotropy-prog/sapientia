'use client'

/**
 * P1RoleCards — Nueva primera pregunta visual del gateway.
 * 4 cards con ilustraciones SVG: rol profesional.
 * Visible en el hero sin botón intermedio.
 * Al seleccionar, activa el gateway (que ahora empieza con la antigua P1).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useCopy } from '@/lib/copy'

const ROLE_IDS = ['leader', 'entrepreneur', 'employee', 'caregiver'] as const

interface P1RoleCardsProps {
  onSelect?: (roleId: string) => void
  animateEntrance?: boolean
}

/* ── Illustration images ──────────────────────────────────────────────────── */

const ILLUSTRATION_IMAGES: Record<string, string> = {
  leader: '/lidero-equipos.png',
  entrepreneur: '/mi-propio-negocio.png',
  employee: '/trabajo-para-otros.png',
  caregiver: '/cuido-o-enseño.png',
}

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function P1RoleCards({ onSelect, animateEntrance = false }: P1RoleCardsProps) {
  const { getCopy } = useCopy()
  const [selected, setSelected] = useState<string | null>(null)
  const [isPulsing, setIsPulsing] = useState(false)
  const [revealedCards, setRevealedCards] = useState<number>(-1)
  const [labelRevealed, setLabelRevealed] = useState(false)

  const roles = useMemo(() => ROLE_IDS.map((id) => ({
    id,
    label: getCopy(`gateway.p1role.${id}`),
  })), [getCopy])

  // Escucha el evento del CTA de below-the-fold para hacer pulse
  useEffect(() => {
    const handler = () => {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 500)
      return () => clearTimeout(timer)
    }
    window.addEventListener('scrollToP1', handler)
    return () => window.removeEventListener('scrollToP1', handler)
  }, [])

  // Stagger entrance
  useEffect(() => {
    if (!animateEntrance) return
    setLabelRevealed(true)
    const timers: ReturnType<typeof setTimeout>[] = []
    ROLE_IDS.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealedCards(i), 100 + i * 150))
    })
    return () => timers.forEach(clearTimeout)
  }, [animateEntrance])

  const handleSelect = useCallback((id: string) => {
    if (selected === id) {
      setSelected(null)
      return
    }
    setSelected(id)
    setTimeout(() => onSelect?.(id), 600)
  }, [selected, onSelect])

  return (
    <div
      id="p1-section"
      className={isPulsing ? 'p1-pulse' : ''}
      style={{ width: '100%' }}
    >
      {/* Pregunta */}
      <p
        className={animateEntrance ? `hero-reveal${labelRevealed ? ' hero-animate-fade-in' : ''}` : ''}
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-h3)',
          lineHeight: 'var(--lh-h3)',
          letterSpacing: 'var(--ls-h3)',
          fontWeight: 500,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-5)',
          textAlign: 'center',
        }}
      >
        {(() => {
          const text = getCopy('gateway.p1role.question')
          const prefix = 'Empieza aquí:'
          if (text.startsWith(prefix)) {
            return <><strong>{prefix}</strong><br /><span style={{ color: '#5273d5' }}>{text.slice(prefix.length).trimStart()}</span></>
          }
          return text
        })()}
      </p>

      {/* Grid de cards — 2×2 en móvil, 4 en desktop */}
      {/* Responsive grid: 2 cols mobile, 4 cols desktop */}
      <style>{`
        .p1-role-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-4);
          max-width: 560px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .p1-role-grid {
            grid-template-columns: repeat(4, 1fr);
            max-width: 820px;
          }
        }
      `}</style>
      <div
        role="radiogroup"
        aria-label={getCopy('gateway.p1role.question')}
        className="p1-role-grid"
      >
        {roles.map((role, index) => {
          const isSelected = selected === role.id
          const shouldAnimate = animateEntrance
          const isRevealed = !shouldAnimate || index <= revealedCards
          const illustrationSrc = ILLUSTRATION_IMAGES[role.id]

          return (
            <button
              key={role.id}
              role="radio"
              aria-checked={isSelected}
              aria-label={role.label}
              onClick={() => handleSelect(role.id)}
              className={shouldAnimate ? `p1-card-reveal${isRevealed ? ' p1-card-animate' : ''}` : ''}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: isSelected ? 'var(--color-bg-secondary)' : 'var(--color-bg-primary)',
                border: isSelected
                  ? '2px solid var(--color-primary)'
                  : '1.5px solid rgba(38,66,51,0.10)',
                borderRadius: 'var(--radius-lg)',
                padding: 0,
                cursor: selected && !isSelected ? 'default' : 'pointer',
                overflow: 'hidden',
                transition: 'all 300ms cubic-bezier(0.65, 0, 0.35, 1)',
                opacity: selected && !isSelected ? 0.5 : 1,
                pointerEvents: selected && !isSelected ? 'none' : 'auto',
                animation: isSelected ? 'selectPulse 300ms cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
              }}
            >
              {/* Check badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: isSelected ? 1 : 0,
                  transform: isSelected ? 'scale(1)' : 'scale(0.5)',
                  transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  zIndex: 2,
                }}
                aria-hidden="true"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Illustration area */}
              <div
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  position: 'relative',
                  overflow: 'hidden',
                  background: isSelected ? 'var(--color-bg-secondary)' : '#F7FAF8',
                  transition: 'background 300ms ease',
                }}
              >
                <Image
                  src={illustrationSrc}
                  alt={role.label}
                  fill
                  sizes="(max-width: 768px) 45vw, 200px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>

              {/* Label */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4) var(--space-4)',
                  textAlign: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.3',
                  }}
                >
                  {role.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
