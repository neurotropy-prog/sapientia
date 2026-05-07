'use client'

/**
 * ProgressiveUnlockModule.tsx — Módulo de desbloqueos progresivos
 *
 * Aparece dentro del CTA section (cuando hasPaid es false), después del acordeón
 * "Qué incluye Semana 1". Muestra qué se desbloquea en los próximos días.
 *
 * Estructura:
 * - 2 primeros items: activos/clickeables
 * - Resto: grises con fecha de disponibilidad
 * - "Sesión con Javier": clickeable → scrolls a #session-cta
 * - Badge "PENDIENTE" en color ámbar/oro para estados pending
 */

import { useCopy } from '@/lib/copy'

interface UnlockItem {
  title: string
  subtitle?: string
  status: 'active' | 'pending' | 'available'
  daysUntil?: number
  isClickable?: boolean
}

interface ProgressiveUnlockModuleProps {
  daysSinceCreation?: number
}

export default function ProgressiveUnlockModule({ daysSinceCreation = 0 }: ProgressiveUnlockModuleProps) {
  const { getCopy } = useCopy()

  const unlockItems: UnlockItem[] = [
    {
      title: getCopy('mapa.unlock.mechanism.title'),
      subtitle: getCopy('mapa.unlock.mechanism.subtitle'),
      status: 'active',
      isClickable: true,
    },
    {
      title: getCopy('mapa.unlock.session.title'),
      subtitle: getCopy('mapa.unlock.session.subtitle'),
      status: 'pending',
      isClickable: true,
    },
    {
      title: getCopy('mapa.unlock.compare.title'),
      subtitle: getCopy('mapa.unlock.compare.subtitle'),
      status: 'active',
      isClickable: true,
    },
    {
      title: getCopy('mapa.unlock.fearsNeeds.title'),
      subtitle: getCopy('mapa.unlock.fearsNeeds.subtitle'),
      status: daysSinceCreation >= 1 ? 'active' : 'available',
      daysUntil: daysSinceCreation >= 1 ? undefined : Math.max(1 - daysSinceCreation, 0),
      isClickable: daysSinceCreation >= 1,
    },
    {
      title: getCopy('mapa.unlock.priority.title'),
      status: daysSinceCreation >= 3 ? 'active' : 'available',
      daysUntil: daysSinceCreation >= 3 ? undefined : Math.max(3 - daysSinceCreation, 0),
      isClickable: daysSinceCreation >= 3,
    },
    {
      title: getCopy('mapa.unlock.bookExcerpt.title'),
      status: daysSinceCreation >= 6 ? 'active' : 'available',
      daysUntil: daysSinceCreation >= 6 ? undefined : Math.max(6 - daysSinceCreation, 0),
      isClickable: daysSinceCreation >= 6,
    },
    {
      title: getCopy('mapa.unlock.evolution.title'),
      status: daysSinceCreation >= 10 ? 'active' : 'available',
      daysUntil: daysSinceCreation >= 10 ? undefined : Math.max(10 - daysSinceCreation, 0),
      isClickable: daysSinceCreation >= 10,
    },
  ]

  function handleSessionClick() {
    const sessionCta = document.getElementById('session-cta')
    if (sessionCta) {
      sessionCta.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function formatDaysUntil(days: number): string {
    if (days === 0) return getCopy('mapa.unlock.today')
    if (days === 1) return getCopy('mapa.unlock.tomorrow')
    return getCopy('mapa.unlock.daysUntil').replace('{days}', days.toString())
  }

  return (
    <div
      style={{
        marginTop: 'var(--space-6)',
        paddingTop: 'var(--space-6)',
        borderTop: '1px solid rgba(180, 90, 50, 0.1)',
      }}
    >
      {/* Título */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          margin: '0 0 var(--space-4) 0',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {getCopy('mapa.unlock.title')}
      </p>

      {/* Lista de items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {unlockItems.map((item, idx) => {
          const isActive = item.status === 'active' || item.status === 'pending'
          const isClickable = item.isClickable || isActive
          const isSessionItem = idx === 0 && item.isClickable

          return (
            <div
              key={idx}
              onClick={() => isSessionItem && handleSessionClick()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: isActive ? 'rgba(205, 121, 108, 0.05)' : 'transparent',
                border: isActive ? '1px solid rgba(205, 121, 108, 0.15)' : 'none',
                cursor: isClickable ? 'pointer' : 'default',
                transition: isClickable ? 'all 0.2s ease' : 'none',
                opacity: !isActive ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.background = 'rgba(205, 121, 108, 0.08)'
                  e.currentTarget.style.transform = 'translateX(4px)'
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable) {
                  e.currentTarget.style.background = isActive ? 'rgba(205, 121, 108, 0.05)' : 'transparent'
                  e.currentTarget.style.transform = 'translateX(0)'
                }
              }}
            >
              {/* Título + Subtitle + Badge (izquierda) */}
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    marginBottom: item.subtitle ? '4px' : 0,
                  }}
                >
                  {item.title}
                </p>

                {/* Subtitle (si existe) — F2: negro para activos, gris solo para bloqueados */}
                {item.subtitle && (
                  <p
                    style={{
                      fontFamily: 'var(--font-host-grotesk)',
                      fontSize: 'var(--text-body-sm)',
                      color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                      margin: 0,
                      lineHeight: 'var(--lh-body-sm)',
                    }}
                  >
                    {item.subtitle}
                  </p>
                )}

                {/* Badge "PENDIENTE" solo para primer item */}
                {item.status === 'pending' && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '6px',
                      fontFamily: 'var(--font-host-grotesk)',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#212426',
                      background: '#edd274',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {getCopy('mapa.unlock.badge.pending')}
                  </span>
                )}
              </div>

              {/* Derecha: status o chevron */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  flexShrink: 0,
                  marginLeft: 'var(--space-3)',
                }}
              >
                {item.status === 'available' && item.daysUntil !== undefined && (
                  <span
                    style={{
                      fontFamily: 'var(--font-host-grotesk)',
                      fontSize: 'var(--text-caption)',
                      color: 'var(--color-text-tertiary)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDaysUntil(item.daysUntil)}
                  </span>
                )}

                {/* Chevron solo para items clickeables */}
                {isClickable && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    style={{
                      flexShrink: 0,
                      color: isActive ? 'var(--color-accent)' : 'var(--color-text-tertiary)',
                    }}
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
