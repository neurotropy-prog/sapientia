'use client'

interface Props {
  content: string
  createdAt: string
  /** Called when user taps GUARDAR — moves message to saved */
  onSave?: () => void
  /** Called when user taps ELIMINAR — removes message from view */
  onDelete?: () => void
  /** Whether this message has been saved */
  saved?: boolean
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'hoy'
  if (days === 1) return 'hace 1 día'
  if (days < 30) return `hace ${days} días`
  const months = Math.floor(days / 30)
  return months === 1 ? 'hace 1 mes' : `hace ${months} meses`
}

export default function PersonalNote({ content, createdAt, onSave, onDelete, saved }: Props) {
  return (
    <div
      className="mapa-fade-up"
      style={{
        background: 'var(--color-bg-secondary)',
        border: 'var(--border-subtle)',
        borderLeft: '3px solid #CD796C',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      {/* Header: label + acciones */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-3)',
      }}>
        <p style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-overline)',
          letterSpacing: 'var(--ls-overline)',
          textTransform: 'uppercase',
          color: '#CD796C',
          margin: 0,
        }}>
          Mensaje de Javier
        </p>

        {(onSave || saved || onDelete) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
            {(onSave || saved) && (
              <button
                onClick={onSave}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: saved ? 'var(--color-text-tertiary)' : '#CD796C',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                }}
              >
                {saved ? '✓ Guardado' : 'Guardar'}
              </button>
            )}
            {(onSave || saved) && onDelete && (
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '12px' }}>|</span>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--color-error)',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                }}
              >
                Eliminar
              </button>
            )}
          </div>
        )}
      </div>

      <p style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontSize: 'var(--text-body-sm)',
        lineHeight: 'var(--lh-body)',
        color: 'var(--color-text-secondary)',
        whiteSpace: 'pre-line',
        margin: '0 0 var(--space-4)',
      }}>
        {content}
      </p>

      <p style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontSize: 'var(--text-caption)',
        color: 'var(--color-text-tertiary)',
        margin: 0,
      }}>
        Recibido {relativeTime(createdAt)}
      </p>
    </div>
  )
}
