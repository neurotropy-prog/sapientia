'use client'

/**
 * AmplifySection.tsx — Sección "Compara tu mapa" en el mapa vivo
 *
 * Aparece entre ZONA 3 (dimensiones) y ZONA 4 (CTA Semana 1).
 * Condiciones: ≥1 visita previa, ≥7 días desde creación, <5 invitaciones activas.
 */

import { useState, useRef, useEffect } from 'react'
import Button from '@/components/ui/Button'
import AmplifyInviteModal from './AmplifyInviteModal'

interface AmplifyProps {
  hash: string
  createdAt: string
  lastVisitedAt: string | null
  inviteCount: number
  profileCode: string | null
}

export default function AmplifySection({
  hash,
  createdAt,
  lastVisitedAt,
  inviteCount,
  profileCode,
}: AmplifyProps) {
  const [showModal, setShowModal] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  // ── Visibility conditions ────────────────────────────────────────────────
  const hasReturnVisit = !!lastVisitedAt
  const daysSinceCreation = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86400000
  )
  const meetsTimeRequirement = daysSinceCreation >= 7
  const hasInviteCapacity = inviteCount < 5

  const shouldShow = hasReturnVisit && meetsTimeRequirement && hasInviteCapacity

  // ── IntersectionObserver (A-15 pattern) ──────────────────────────────────
  useEffect(() => {
    if (!shouldShow || !sectionRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [shouldShow])

  if (!shouldShow) return null

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          padding: 'var(--space-12) 0',
          borderTop: '1px solid var(--border-subtle-color, rgba(255,255,255,0.06))',
          borderBottom: '1px solid var(--border-subtle-color, rgba(255,255,255,0.06))',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 600ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)), transform 600ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1))',
        }}
      >
        {/* Overline */}
        <p style={{
          fontFamily: 'var(--font-inter-tight, var(--font-inter, system-ui))',
          fontSize: 'var(--text-overline, 0.75rem)',
          letterSpacing: 'var(--ls-overline, 0.1em)',
          textTransform: 'uppercase',
          color: 'var(--color-accent)',
          marginBottom: 'var(--space-4)',
        }}>
          Compara tu mapa
        </p>

        {/* Headline */}
        <h2 style={{
          fontFamily: 'var(--font-cormorant, var(--font-lora, Georgia))',
          fontSize: 'var(--text-h3, 1.59rem)',
          lineHeight: 'var(--lh-h3, 1.3)',
          fontWeight: 400,
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
        }}>
          {'¿Crees que hacer este análisis puede ser de utilidad para tu pareja, un socio, un amigo?'}
        </h2>

        {/* CTA ghost */}
        <Button
          variant="ghost"
          onClick={() => setShowModal(true)}
          style={{ marginBottom: 'var(--space-4)' }}
        >
          Envíale el link
        </Button>

        {/* Privacy micro-copy */}
        <p style={{
          fontFamily: 'var(--font-inter, system-ui)',
          fontSize: 'var(--text-caption, 0.75rem)',
          lineHeight: 'var(--lh-body-sm, 1.5)',
          color: 'var(--color-text-tertiary)',
          fontStyle: 'italic',
        }}>
          &ldquo;Su diagnóstico es confidencial. Solo se compara si ambos aceptáis.&rdquo;
        </p>
      </section>

      {/* Modal de invitación */}
      <AmplifyInviteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        hash={hash}
        profileCode={profileCode}
      />
    </>
  )
}
