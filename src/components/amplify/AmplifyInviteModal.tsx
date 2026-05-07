'use client'

/**
 * AmplifyInviteModal.tsx — Modal de invitación AMPLIFY (3 pasos)
 *
 * Paso 1: Relación (opcional) — chips de selección
 * Paso 2: Compartir — link copiable, WhatsApp, email
 * Paso 3: Confirmación — "Invitación lista"
 *
 * El copy de compartir se calibra según el perfil del invitador (PC/FI/CE/CP).
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import Button from '@/components/ui/Button'
import { useCopy } from '@/lib/copy'

// ─── TIPOS ──────────────────────────────────────────────────────────────────

type ModalStep = 'relationship' | 'share' | 'confirmation'
type Relationship = 'pareja' | 'socio' | 'amigo' | 'otro'

interface AmplifyInviteModalProps {
  isOpen: boolean
  onClose: () => void
  hash: string
  profileCode: string | null
}

// ─── COPY CALIBRADO POR PERFIL ──────────────────────────────────────────────

interface ShareCopy {
  whatsapp: string
  emailSubject: string
  emailBody: string
}

function getShareCopy(profileCode: string | null, inviteUrl: string, getCopyFn?: (key: string) => string): ShareCopy {
  const link = inviteUrl
  const gc = getCopyFn ?? ((k: string) => k) // fallback returns key = no override
  const profiles: Record<string, string> = { PC: 'pc', FI: 'fi', CE: 'ce', CP: 'cp' }
  const code = (profileCode && profiles[profileCode]) ? profiles[profileCode] : 'default'

  const whatsappKey = `amplify.share.${code}.whatsapp`
  const subjectKey = `amplify.share.${code}.email_subject`
  const bodyKey = `amplify.share.${code}.email_body`

  const whatsappTpl = getCopyFn ? gc(whatsappKey) : null
  const subjectTpl = getCopyFn ? gc(subjectKey) : null
  const bodyTpl = getCopyFn ? gc(bodyKey) : null

  // If copy was found (not just returning the key), use the override
  const hasOverride = (val: string | null, key: string) => val !== null && val !== key

  // Defaults per profile
  const defaults: Record<string, ShareCopy> = {
    pc: {
      whatsapp: `He hecho un análisis de regulación nerviosa. Son 3 minutos y te da datos reales sobre sueño, energía y productividad. ¿Lo hacemos los dos y comparamos? ${link}`,
      emailSubject: 'Diagnóstico de productividad — ¿comparamos datos?',
      emailBody: `He hecho un análisis de regulación nerviosa. Son 3 minutos y te da datos reales sobre sueño, energía y productividad.\n\n¿Lo hacemos los dos y comparamos?\n\n${link}`,
    },
    fi: {
      whatsapp: `He encontrado un análisis de regulación nerviosa basado en datos. Sin narrativa, solo números. Si lo haces tú también podemos comparar métricas. 3 minutos: ${link}`,
      emailSubject: 'Análisis de regulación — datos comparativos',
      emailBody: `He encontrado un análisis de regulación nerviosa basado en datos. Sin narrativa, solo números.\n\nSi lo haces tú también, podemos comparar métricas. Son 3 minutos:\n\n${link}`,
    },
    ce: {
      whatsapp: `He descubierto algo sobre regulación nerviosa que me ha ayudado. Si tú también lo haces, podemos ver cómo estamos los dos. Es confidencial y son 3 minutos: ${link}`,
      emailSubject: 'Algo que nos puede ayudar a los dos',
      emailBody: `He descubierto algo sobre regulación nerviosa que me ha ayudado a entender mejor cómo estoy.\n\nSi tú también lo haces, podemos ver cómo estamos los dos. Es confidencial y son 3 minutos:\n\n${link}`,
    },
    cp: {
      whatsapp: `He hecho un diagnóstico estructurado de 5 dimensiones de regulación nerviosa. Si lo haces tú, comparamos resultados con un plan de seguimiento. 3 minutos: ${link}`,
      emailSubject: 'Plan de regulación comparativa — ¿te apuntas?',
      emailBody: `He hecho un diagnóstico estructurado de 5 dimensiones de regulación nerviosa.\n\nSi lo haces tú, podemos comparar resultados con un plan de seguimiento. Son 3 minutos:\n\n${link}`,
    },
    default: {
      whatsapp: `He hecho un diagnóstico de regulación nerviosa y me gustaría que lo hicieras tú también para poder comparar nuestros resultados. Son 3 minutos: ${link}`,
      emailSubject: 'Diagnóstico de regulación — ¿comparamos?',
      emailBody: `He hecho un diagnóstico de regulación nerviosa y me gustaría que lo hicieras tú también para poder comparar nuestros resultados.\n\nSon 3 minutos:\n\n${link}`,
    },
  }

  const d = defaults[code] ?? defaults.default

  return {
    whatsapp: hasOverride(whatsappTpl, whatsappKey) ? whatsappTpl!.replace('{link}', link) : d.whatsapp,
    emailSubject: hasOverride(subjectTpl, subjectKey) ? subjectTpl! : d.emailSubject,
    emailBody: hasOverride(bodyTpl, bodyKey) ? bodyTpl!.replace('{link}', link) : d.emailBody,
  }
}

// ─── RELATIONSHIPS ──────────────────────────────────────────────────────────

const RELATIONSHIPS: { key: Relationship; copyKey: string; fallback: string }[] = [
  { key: 'pareja', copyKey: 'amplify.modal.step1.rel_partner', fallback: 'Mi pareja' },
  { key: 'socio', copyKey: 'amplify.modal.step1.rel_business', fallback: 'Mi socio/a' },
  { key: 'amigo', copyKey: 'amplify.modal.step1.rel_friend', fallback: 'Un amigo/a' },
  { key: 'otro', copyKey: 'amplify.modal.step1.rel_other', fallback: 'Otro' },
]

// ─── COMPONENTE ─────────────────────────────────────────────────────────────

export default function AmplifyInviteModal({
  isOpen,
  onClose,
  hash,
  profileCode,
}: AmplifyInviteModalProps) {
  const [step, setStep] = useState<ModalStep>('relationship')
  const [relationship, setRelationship] = useState<Relationship | null>(null)
  const [inviteUrl, setInviteUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { getCopy } = useCopy()
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  // ── Reset on open ─────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setStep('relationship')
      setRelationship(null)
      setInviteUrl(null)
      setLoading(false)
      setError(null)
      setCopied(false)
    }
  }, [isOpen])

  // ── Focus trap + Escape ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Focus first element
    setTimeout(() => firstFocusRef.current?.focus(), 100)

    // Prevent body scroll
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // ── Create invitation (FASE VISUAL: mock) ─────────────────────────────
  const createInvitation = useCallback(async (rel: Relationship | null) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/amplify/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inviter_hash: hash,
          channel: 'link',
          relationship_hint: rel,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'No se pudo crear la invitación.')
        setLoading(false)
        return
      }
      setInviteUrl(data.invite_url)
      setStep('share')
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [hash])

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleRelationshipSelect = (rel: Relationship) => {
    setRelationship(rel)
    createInvitation(rel)
  }

  const handleSkip = () => {
    createInvitation(null)
  }

  const handleCopy = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      // Fallback: select text
      setCopied(false)
    }
  }

  const handleWhatsApp = () => {
    if (!inviteUrl) return
    const copy = getShareCopy(profileCode, inviteUrl, getCopy)
    window.open(
      `https://wa.me/?text=${encodeURIComponent(copy.whatsapp)}`,
      '_blank',
      'noopener'
    )
    setStep('confirmation')
  }

  const handleEmail = () => {
    if (!inviteUrl) return
    const copy = getShareCopy(profileCode, inviteUrl, getCopy)
    window.location.href = `mailto:?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(copy.emailBody)}`
    setStep('confirmation')
  }

  // ── Render ────────────────────────────────────────────────────────────

  if (!isOpen) return null

  const shareCopy = inviteUrl ? getShareCopy(profileCode, inviteUrl, getCopy) : null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Envíale el link"
    >
      {/* Backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
      }} />

      {/* Modal content */}
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          background: 'var(--color-bg-primary, #0B0F0E)',
          border: '1px solid var(--border-subtle-color, rgba(255,255,255,0.08))',
          borderRadius: 'var(--radius-xl, 16px)',
          padding: 'var(--space-8) var(--space-6)',
          maxWidth: '420px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'mapaFadeUp 300ms var(--ease-out-expo, cubic-bezier(0.16,1,0.3,1)) both',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: 'var(--space-2)',
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* ── PASO 1: Relación ────────────────────────────────────────── */}
        {step === 'relationship' && (
          <div style={{
            animation: 'mapaFadeUp 200ms ease both',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant, var(--font-lora, Georgia))',
              fontSize: 'var(--text-h3, 1.59rem)',
              lineHeight: 'var(--lh-h3, 1.3)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
            }}>
              {getCopy('amplify.modal.step1.heading')}
            </h3>
            <p style={{
              fontFamily: 'var(--font-inter, system-ui)',
              fontSize: 'var(--text-body-sm, 0.875rem)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-6)',
              lineHeight: 'var(--lh-body-sm, 1.5)',
            }}>
              {getCopy('amplify.modal.step1.subtext')}
            </p>

            {/* Relationship chips */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-6)',
            }}>
              {RELATIONSHIPS.map((rel, i) => (
                <button
                  key={rel.key}
                  ref={i === 0 ? firstFocusRef : undefined}
                  onClick={() => handleRelationshipSelect(rel.key)}
                  disabled={loading}
                  style={{
                    fontFamily: 'var(--font-inter, system-ui)',
                    fontSize: 'var(--text-body-sm, 0.875rem)',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    background: 'transparent',
                    border: '1px solid var(--color-surface-subtle, rgba(255,255,255,0.12))',
                    borderRadius: 'var(--radius-pill, 9999px)',
                    padding: 'var(--space-3) var(--space-5)',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all var(--transition-base, 200ms ease)',
                    opacity: loading ? 0.5 : 1,
                  }}
                >
                  {getCopy(rel.copyKey)}
                </button>
              ))}
            </div>

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={loading}
              style={{
                fontFamily: 'var(--font-inter, system-ui)',
                fontSize: 'var(--text-body-sm, 0.875rem)',
                color: 'var(--color-text-tertiary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'none',
              }}
            >
              {getCopy('amplify.modal.step1.skip')}
            </button>

            {/* Error */}
            {error && (
              <p style={{
                fontFamily: 'var(--font-inter, system-ui)',
                fontSize: 'var(--text-caption, 0.75rem)',
                color: 'var(--color-error, #C44040)',
                marginTop: 'var(--space-4)',
              }}>
                {error}
              </p>
            )}

            {/* Loading indicator */}
            {loading && (
              <p style={{
                fontFamily: 'var(--font-inter, system-ui)',
                fontSize: 'var(--text-caption, 0.75rem)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-4)',
              }}>
                Generando invitación...
              </p>
            )}
          </div>
        )}

        {/* ── PASO 2: Compartir ───────────────────────────────────────── */}
        {step === 'share' && inviteUrl && (
          <div style={{
            animation: 'mapaFadeUp 200ms ease both',
          }}>
            <h3 style={{
              fontFamily: 'var(--font-cormorant, var(--font-lora, Georgia))',
              fontSize: 'var(--text-h3, 1.59rem)',
              lineHeight: 'var(--lh-h3, 1.3)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-3)',
            }}>
              {getCopy('amplify.modal.step2.heading')}
            </h3>
            <p style={{
              fontFamily: 'var(--font-inter, system-ui)',
              fontSize: 'var(--text-body-sm, 0.875rem)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-6)',
              lineHeight: 'var(--lh-body-sm, 1.5)',
            }}>
              {getCopy('amplify.modal.step2.subtext')}
            </p>

            {/* Copiable link */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              background: 'var(--color-bg-secondary, rgba(255,255,255,0.03))',
              border: '1px solid var(--color-surface-subtle, rgba(255,255,255,0.08))',
              borderRadius: 'var(--radius-md, 12px)',
              padding: 'var(--space-3) var(--space-4)',
              marginBottom: 'var(--space-5)',
            }}>
              <span style={{
                flex: 1,
                fontFamily: 'var(--font-inter, system-ui)',
                fontSize: 'var(--text-body-sm, 0.875rem)',
                color: 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {inviteUrl}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  flexShrink: 0,
                  fontFamily: 'var(--font-inter, system-ui)',
                  fontSize: 'var(--text-body-sm, 0.875rem)',
                  fontWeight: 500,
                  color: copied ? 'var(--color-success, #3D9A5F)' : 'var(--color-accent)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 'var(--space-1) var(--space-2)',
                  transition: 'color var(--transition-base, 200ms ease)',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? getCopy('amplify.modal.step2.copied') : getCopy('amplify.modal.step2.copy_button')}
              </button>
            </div>

            {/* Share buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-6)',
            }}>
              <Button
                variant="ghost"
                onClick={handleWhatsApp}
                style={{ width: '100%', textAlign: 'center' }}
              >
                {getCopy('amplify.modal.step2.whatsapp')}
              </Button>
              <Button
                variant="ghost"
                onClick={handleEmail}
                style={{ width: '100%', textAlign: 'center' }}
              >
                {getCopy('amplify.modal.step2.email')}
              </Button>
            </div>

            {/* Expiry notice */}
            <p style={{
              fontFamily: 'var(--font-inter, system-ui)',
              fontSize: 'var(--text-caption, 0.75rem)',
              color: 'var(--color-text-tertiary)',
              fontStyle: 'italic',
            }}>
              {getCopy('amplify.modal.step2.expiry')}
            </p>
          </div>
        )}

        {/* ── PASO 3: Confirmación ────────────────────────────────────── */}
        {step === 'confirmation' && (
          <div style={{
            animation: 'mapaFadeUp 200ms ease both',
            textAlign: 'center',
            padding: 'var(--space-4) 0',
          }}>
            {/* Check icon */}
            <div style={{
              fontSize: '2rem',
              marginBottom: 'var(--space-4)',
              color: 'var(--color-success, #3D9A5F)',
            }}>
              ✓
            </div>

            <h3 style={{
              fontFamily: 'var(--font-cormorant, var(--font-lora, Georgia))',
              fontSize: 'var(--text-h3, 1.59rem)',
              lineHeight: 'var(--lh-h3, 1.3)',
              fontWeight: 400,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              {getCopy('amplify.modal.step3.heading')}
            </h3>

            <p style={{
              fontFamily: 'var(--font-inter, system-ui)',
              fontSize: 'var(--text-body, 1rem)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--lh-body, 1.6)',
              marginBottom: 'var(--space-8)',
            }}>
              {getCopy('amplify.modal.step3.confirmation')}
            </p>

            <Button
              variant="ghost"
              onClick={onClose}
            >
              {getCopy('amplify.modal.step3.close')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
