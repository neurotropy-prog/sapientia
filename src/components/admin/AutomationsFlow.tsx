'use client'

/**
 * AutomationsFlow — Full vertical flow visualization of the email automation system.
 *
 * Two sections:
 *   1. Secuencia de nurturing (d0–d90 + suppression rule + goodbye)
 *   2. Emails especiales (post-pago, booking confirmation, reminder)
 */

import { useState, useCallback } from 'react'
import EmailFlowNode from './EmailFlowNode'
import SuppressionNode from './SuppressionNode'

interface EmailData {
  key: string
  name: string
  subject: string
  trigger: string
  day: number
  sent: number
  opened: number
  open_rate: number
}

interface TemplateInfo {
  email_key: string
  is_customized: boolean
}

interface AutomationsFlowProps {
  emails: EmailData[] | null
  loading: boolean
  templates?: TemplateInfo[]
  onEditTemplate?: (emailKey: string) => void
}

// ── Email content metadata (descriptions + CTAs from email.ts) ──────────────

const EMAIL_META: Record<string, { description: string; cta: string; conditions?: string }> = {
  d0: {
    description:
      'Envío inmediato al capturar email. Incluye score global, las 5 dimensiones con barras de color, la dimensión más comprometida y enlace al mapa interactivo.',
    cta: 'Ver mi mapa',
  },
  d1: {
    description:
      'Notifica que se han desbloqueado los miedos principales, las 3 capas de necesidad y los patrones de burnout. Completa el mecanismo de defensa adaptativo.',
    cta: 'Ver mi mapa',
  },
  d3: {
    description:
      'Análisis en profundidad de la dimensión más comprometida. Un nivel de detalle que no existía en la evaluación inicial.',
    cta: 'Ver mi mapa',
  },
  d6: {
    description:
      'Extracto personalizado del libro "Burnout Ejecutivo: El Renacimiento del Líder Fénix", basado en la dimensión más comprometida.',
    cta: 'Ver mi mapa',
  },
  d10: {
    description:
      'Primera reevaluación: actualiza el mapa en 30 segundos. Los scores anteriores se guardan para ver la evolución real.',
    cta: 'Actualizar mi mapa',
  },
  d30: {
    description:
      'Reevaluación a 30 días. Actualiza el mapa en 30 segundos. Los scores anteriores se guardan para comparar evolución.',
    cta: 'Actualizar mi mapa',
  },
  d90: {
    description:
      'Reevaluación trimestral. "¿Ha cambiado algo?" El mapa sigue vivo, actualizable en 30 segundos.',
    cta: 'Actualizar mi mapa',
    conditions: 'Se repite cada 90 días mientras el usuario esté activo',
  },
  goodbye: {
    description:
      'Email de despedida empática. Mensaje cálido: "Tu mapa sigue aquí. Sigue vivo." Con opción de reactivar en un clic. Sin footer de baja.',
    cta: 'Seguir recibiendo actualizaciones',
    conditions: 'Se envía cuando 3+ emails consecutivos no se abren',
  },
}

// ── Special emails (no API stats — static nodes) ────────────────────────────

const SPECIAL_EMAILS: EmailData[] = [
  {
    key: 'post_pago',
    name: 'Bienvenida Semana 1',
    subject: 'Tu Semana 1 empieza ahora — aquí tienes todo',
    trigger: 'Inmediato al confirmar pago (Stripe webhook)',
    day: 0,
    sent: 0, opened: 0, open_rate: 0,
  },
  {
    key: 'booking_confirm',
    name: 'Confirmación de sesión',
    subject: 'Tu sesión con Javier está confirmada',
    trigger: 'Inmediato al reservar sesión (Cal.com webhook)',
    day: 0,
    sent: 0, opened: 0, open_rate: 0,
  },
  {
    key: 'booking_reminder',
    name: 'Recordatorio 24h',
    subject: 'Mañana: tu sesión con Javier',
    trigger: '24h antes de la sesión (cron job)',
    day: 0,
    sent: 0, opened: 0, open_rate: 0,
  },
]

const SPECIAL_META: Record<string, { description: string; cta: string }> = {
  post_pago: {
    description:
      'Email de bienvenida al programa LARS. Incluye acceso a Semana 1, recordatorio de garantía de 7 días, y datos de contacto directo con Javier.',
    cta: 'Acceder a Semana 1',
  },
  booking_confirm: {
    description:
      'Confirmación de sesión con datos: fecha, hora, enlace de videollamada. Enviado tanto al usuario como a Javier.',
    cta: 'Ver detalles de sesión',
  },
  booking_reminder: {
    description:
      'Recordatorio 24h antes de la sesión. Incluye hora y enlace de videollamada.',
    cta: 'Preparar sesión',
  },
}

// ── Action emails metadata ──────────────────────────────────────────────────

interface ActionEmailMeta {
  type: string
  name: string
  icon: string
  subject: string
  description: string
  cta: string
  trigger: string
}

const ACTION_EMAILS: ActionEmailMeta[] = [
  {
    type: 'personal_note',
    name: 'Nota personal',
    icon: '✍️',
    subject: 'Un mensaje de Javier sobre tu análisis',
    description:
      'Email con mensaje personalizado de Javier. El contenido se escribe al momento de enviar desde el panel de acciones del lead.',
    cta: 'Ver mi mapa',
    trigger: 'Manual — al ejecutar "Nota personal" en un lead',
  },
  {
    type: 'video',
    name: 'Video personalizado',
    icon: '🎬',
    subject: 'Javier ha grabado algo para ti',
    description:
      'Notifica al lead que Javier ha grabado un video personalizado. El enlace dirige al mapa con el parámetro ?video=1.',
    cta: 'Ver mensaje de Javier',
    trigger: 'Manual — al ejecutar "Video personalizado" en un lead',
  },
  {
    type: 'early_unlock',
    name: 'Desbloqueo anticipado',
    icon: '🔓',
    subject: 'Contenido nuevo desbloqueado en tu mapa',
    description:
      'Notifica que se han desbloqueado subdimensiones, insight colectivo y arquetipo antes de tiempo. Desbloquea automáticamente el contenido en map_evolution.',
    cta: 'Ver mi mapa',
    trigger: 'Manual — al ejecutar "Desbloqueo anticipado" en un lead',
  },
  {
    type: 'express_session',
    name: 'Sesión express (10 min)',
    icon: '📞',
    subject: 'Javier quiere hablar contigo — 10 minutos',
    description:
      'Invitación a sesión express de 10 minutos. Crea automáticamente un slot de booking para el día siguiente a las 10:00.',
    cta: 'Ver mi mapa',
    trigger: 'Manual — al ejecutar "Sesión express" en un lead',
  },
  {
    type: 'manual_email',
    name: 'Email manual',
    icon: '📧',
    subject: 'Un mensaje del Instituto Epigenético',
    description:
      'Email completamente libre — Javier escribe el contenido directamente desde el formulario de acción. Sin template fijo.',
    cta: 'Ver mi mapa',
    trigger: 'Manual — al ejecutar "Email manual" en un lead',
  },
]

// ── Action email node ────────────────────────────────────────────────────────

function ActionFlowNode({ action }: { action: ActionEmailMeta }) {
  const [expanded, setExpanded] = useState(false)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const loadPreview = useCallback(async () => {
    if (previewHtml) {
      setExpanded((v) => !v)
      return
    }
    setPreviewLoading(true)
    setExpanded(true)
    try {
      const res = await fetch(`/api/admin/templates/action-preview?type=${action.type}`)
      if (res.ok) {
        const html = await res.text()
        setPreviewHtml(html)
      }
    } catch {
      // silently fail
    } finally {
      setPreviewLoading(false)
    }
  }, [action.type, previewHtml])

  return (
    <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
      {/* Left connector */}
      <div
        style={{
          width: '40px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div style={{ width: '2px', height: '24px', background: 'rgba(38, 66, 51, 0.20)' }} />
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'var(--color-primary, #264233)',
            flexShrink: 0,
          }}
        />
        <div style={{ width: '2px', flex: 1, background: 'rgba(38, 66, 51, 0.20)' }} />
      </div>

      {/* Content card */}
      <div
        style={{
          flex: 1,
          background: 'var(--color-bg-tertiary)',
          border: 'var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          marginBottom: 'var(--space-4)',
          marginLeft: 'var(--space-3)',
        }}
      >
        {/* Row 1: Icon + name + badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-2)',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-primary, #264233)',
              background: 'rgba(38, 66, 51, 0.08)',
              padding: '3px 10px',
              borderRadius: '100px',
              whiteSpace: 'nowrap',
            }}
          >
            {action.icon} Manual
          </span>
          <span
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
            }}
          >
            {action.name}
          </span>
        </div>

        {/* Row 2: Subject */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-secondary)',
            margin: '0 0 var(--space-1) 0',
          }}
        >
          Asunto: {action.subject}
        </p>

        {/* Row 3: Trigger */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: '13px',
            color: 'var(--color-text-tertiary)',
            margin: '0 0 var(--space-3) 0',
          }}
        >
          {action.trigger}
        </p>

        {/* Preview button */}
        <button
          onClick={loadPreview}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-primary, #264233)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {expanded ? 'Ocultar preview' : 'Ver preview del email'}
          <span
            style={{
              display: 'inline-block',
              transition: 'transform 200ms ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              fontSize: '12px',
            }}
          >
            ▾
          </span>
        </button>

        {/* Expandable preview */}
        {expanded && (
          <div
            style={{
              marginTop: 'var(--space-3)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: 'var(--border-subtle)',
            }}
          >
            {/* Description bar */}
            <div
              style={{
                background: 'var(--color-bg-secondary)',
                padding: 'var(--space-3) var(--space-4)',
                borderBottom: 'var(--border-subtle)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: '13px',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {action.description}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginTop: 'var(--space-2)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--color-text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  CTA:
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-primary, #264233)',
                    background: 'rgba(38, 66, 51, 0.08)',
                    padding: '2px 10px',
                    borderRadius: '100px',
                  }}
                >
                  {action.cta}
                </span>
              </div>
            </div>

            {/* Email preview iframe */}
            {previewLoading ? (
              <div
                style={{
                  height: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#FFFFFF',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: '13px',
                    color: 'var(--color-text-tertiary)',
                  }}
                >
                  Cargando preview...
                </span>
              </div>
            ) : previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                style={{
                  width: '100%',
                  height: '500px',
                  border: 'none',
                  background: '#FFFFFF',
                }}
                title={`Preview: ${action.name}`}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function FlowSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ display: 'flex', gap: 0 }}>
          <div
            style={{
              width: '40px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '2px', height: '24px', background: 'rgba(205,121,108,0.15)' }} />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'rgba(205,121,108,0.15)',
              }}
            />
            {i < 4 && (
              <div style={{ width: '2px', height: '80px', background: 'rgba(205,121,108,0.15)' }} />
            )}
          </div>
          <div
            style={{
              flex: 1,
              background: 'var(--color-bg-tertiary)',
              border: 'var(--border-subtle)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-4)',
              marginLeft: 'var(--space-3)',
              minHeight: '100px',
            }}
          >
            <div
              style={{
                width: '120px',
                height: '14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-secondary)',
                marginBottom: 'var(--space-3)',
                animation: 'hubPulse 1.5s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '200px',
                height: '12px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-bg-secondary)',
                animation: 'hubPulse 1.5s ease-in-out infinite',
                animationDelay: '0.2s',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        margin: 'var(--space-8) 0 var(--space-5) 0',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--color-text-tertiary)',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
      <div
        style={{
          flex: 1,
          height: '1px',
          background: 'rgba(180, 90, 50, 0.15)',
        }}
      />
    </div>
  )
}

// ── Component ───────────────────────────────────────────────────────────────

export default function AutomationsFlow({ emails, loading, templates, onEditTemplate }: AutomationsFlowProps) {
  if (loading || !emails) {
    return (
      <div>
        <SectionHeader title="Secuencia de nurturing" />
        <FlowSkeleton />
      </div>
    )
  }

  // Split: nurturing emails (d0–d90) vs goodbye
  const nurturingEmails = emails.filter((e) => e.key !== 'goodbye')
  const goodbyeEmail = emails.find((e) => e.key === 'goodbye')

  const isCustomized = (key: string) =>
    templates?.some((t) => t.email_key === key && t.is_customized) ?? false

  return (
    <div>
      {/* ── Section 1: Nurturing sequence ─────────────────────────────── */}
      <SectionHeader title="Secuencia de nurturing" />

      {nurturingEmails.map((email) => {
        const meta = EMAIL_META[email.key]
        if (!meta) return null
        return (
          <EmailFlowNode
            key={email.key}
            email={email}
            description={meta.description}
            cta={meta.cta}
            conditions={meta.conditions}
            onEdit={onEditTemplate}
            isCustomized={isCustomized(email.key)}
          />
        )
      })}

      {/* Suppression rule */}
      <SuppressionNode />

      {/* Goodbye email (after suppression rule) */}
      {goodbyeEmail && EMAIL_META.goodbye && (
        <EmailFlowNode
          email={goodbyeEmail}
          description={EMAIL_META.goodbye.description}
          cta={EMAIL_META.goodbye.cta}
          conditions={EMAIL_META.goodbye.conditions}
          isLast
          onEdit={onEditTemplate}
          isCustomized={isCustomized('goodbye')}
        />
      )}

      {/* ── Section 2: Special emails ─────────────────────────────────── */}
      <SectionHeader title="Emails especiales" />

      {SPECIAL_EMAILS.map((email, i) => {
        const meta = SPECIAL_META[email.key]
        if (!meta) return null
        return (
          <EmailFlowNode
            key={email.key}
            email={email}
            description={meta.description}
            cta={meta.cta}
            isSpecial
            isLast={i === SPECIAL_EMAILS.length - 1}
            onEdit={email.key === 'post_pago' ? onEditTemplate : undefined}
            isCustomized={isCustomized(email.key)}
          />
        )
      })}

      {/* ── Section 3: Action emails (suggested actions) ──────────────── */}
      <SectionHeader title="Acciones sugeridas" />

      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: '13px',
          color: 'var(--color-text-tertiary)',
          margin: '0 0 var(--space-4) 52px',
          lineHeight: 1.5,
        }}
      >
        Emails que se envían al ejecutar una acción desde el panel de un lead.
        Cada uno usa el mismo template visual pero con contenido personalizado.
      </p>

      {ACTION_EMAILS.map((action) => (
        <ActionFlowNode key={action.type} action={action} />
      ))}
    </div>
  )
}
