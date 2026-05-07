'use client'

/**
 * AmplifyAcceptBanner.tsx — Banner de aceptación/rechazo para invitados
 *
 * Aparece cuando el invitado ha completado el gateway vía ?ref=
 * y su invitación está en status "completed" (gateway hecho, no aceptado/rechazado aún).
 *
 * Se muestra DESPUÉS de la revelación progresiva del mapa (no interrumpe la experiencia).
 */

import { useState, useCallback } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface AmplifyAcceptBannerProps {
  inviteHash: string
  inviterInitials: string
  inviteeHash: string
  onAccepted: (compareUrl: string) => void
  onDeclined: () => void
}

export default function AmplifyAcceptBanner({
  inviteHash,
  inviterInitials,
  inviteeHash,
  onAccepted,
  onDeclined,
}: AmplifyAcceptBannerProps) {
  const [state, setState] = useState<'prompt' | 'accepting' | 'accepted' | 'declining' | 'declined'>('prompt')
  const [compareUrl, setCompareUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAccept = useCallback(async () => {
    setState('accepting')
    setError(null)
    try {
      const res = await fetch('/api/amplify/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invite_hash: inviteHash,
          invitee_hash: inviteeHash,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'No se pudo aceptar la comparación.')
        setState('prompt')
        return
      }
      setCompareUrl(data.compare_url)
      setState('accepted')
      onAccepted(data.compare_url)
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
      setState('prompt')
    }
  }, [inviteHash, inviteeHash, onAccepted])

  const handleDecline = useCallback(async () => {
    setState('declining')
    try {
      await fetch('/api/amplify/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_hash: inviteHash }),
      })
    } catch {
      // Silent fail — declining is non-critical
    }
    setState('declined')
    onDeclined()
  }, [inviteHash, onDeclined])

  // ── Declined: fade out and disappear ──────────────────────────────────
  if (state === 'declined') return null

  return (
    <div style={{
      marginBottom: 'var(--space-8)',
      animation: 'mapaFadeUp 500ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) both',
    }}>
      <Card style={{
        border: '1px solid rgba(var(--color-accent-rgb, 180,90,50), 0.15)',
        background: 'var(--color-bg-primary, #0B0F0E)',
      }}>
        {/* ── Prompt state ──────────────────────────────────────────── */}
        {(state === 'prompt' || state === 'accepting' || state === 'declining') && (
          <>
            <h3 style={{
              fontFamily: 'var(--font-cormorant, var(--font-lora, Georgia))',
              fontSize: 'var(--text-h4, 1.25rem)',
              lineHeight: 'var(--lh-h4, 1.35)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
            }}>
              Alguien te ha invitado a comparar vuestros mapas.
            </h3>

            <p style={{
              fontFamily: 'var(--font-inter, system-ui)',
              fontSize: 'var(--text-body-sm, 0.875rem)',
              lineHeight: 'var(--lh-body-sm, 1.5)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-6)',
            }}>
              Si aceptas, ambos podréis ver cómo se comparan vuestras 5 dimensiones.
              Tu mapa sigue siendo privado — solo se comparan los scores.
            </p>

            {/* Two buttons of equal weight */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              flexWrap: 'wrap',
            }}>
              <Button
                variant="ghost"
                onClick={handleAccept}
                disabled={state === 'accepting' || state === 'declining'}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  textAlign: 'center',
                  opacity: state === 'accepting' ? 0.6 : 1,
                }}
              >
                {state === 'accepting' ? 'Aceptando...' : 'Aceptar comparación'}
              </Button>
              <button
                onClick={handleDecline}
                disabled={state === 'accepting' || state === 'declining'}
                style={{
                  flex: 1,
                  minWidth: '100px',
                  fontFamily: 'var(--font-inter, system-ui)',
                  fontSize: 'var(--text-body-sm, 0.875rem)',
                  color: 'var(--color-text-tertiary)',
                  background: 'transparent',
                  border: 'none',
                  cursor: state === 'declining' ? 'wait' : 'pointer',
                  padding: 'var(--space-3)',
                  textAlign: 'center',
                  transition: 'color var(--transition-base, 200ms ease)',
                  opacity: state === 'declining' ? 0.6 : 1,
                }}
              >
                No, gracias
              </button>
            </div>

            {/* Error */}
            {error && (
              <p style={{
                fontFamily: 'var(--font-inter, system-ui)',
                fontSize: 'var(--text-caption, 0.75rem)',
                color: 'var(--color-error, #C44040)',
                marginTop: 'var(--space-3)',
              }}>
                {error}
              </p>
            )}
          </>
        )}

        {/* ── Accepted state ────────────────────────────────────────── */}
        {state === 'accepted' && (
          <div style={{ animation: 'mapaFadeUp 300ms ease both' }}>
            <p style={{
              fontFamily: 'var(--font-inter, system-ui)',
              fontSize: 'var(--text-body, 1rem)',
              color: 'var(--color-success, #3D9A5F)',
              marginBottom: 'var(--space-3)',
              fontWeight: 500,
            }}>
              Comparación activada.
            </p>
            <p style={{
              fontFamily: 'var(--font-inter, system-ui)',
              fontSize: 'var(--text-body-sm, 0.875rem)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-5)',
              lineHeight: 'var(--lh-body-sm, 1.5)',
            }}>
              La puedes ver ahora.
            </p>
            {compareUrl && (
              <Button
                variant="ghost"
                onClick={() => { window.location.href = compareUrl }}
              >
                Ver comparación →
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
