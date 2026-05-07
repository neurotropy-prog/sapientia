'use client'

/**
 * /admin/tools — Fast-Forward Testing + Email Preview + Config
 */

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

interface EvolutionResult {
  previousCreatedAt: string
  newCreatedAt: string
  daysSinceCreation: number
  evolution: {
    archetype: boolean
    fearsNeeds: boolean
    priorityDeep: boolean
    bookExcerpt: boolean
    evolution: boolean
    nextQuarterly: boolean
  }
}

interface EmailPreview {
  emailKey: string
  subject: string
  bodyContent: string
  ctaText: string
  isDynamic: boolean
  dynamicNote: string | null
  hasOverride: boolean
}

const DAY_PRESETS = [
  { label: 'Día 0 — Análisis inicial', day: 0, emailKey: 'd0', color: '#878E92' },
  { label: 'Día 1 — Miedos + necesidades', day: 1, emailKey: 'd1', color: '#CD796C' },
  { label: 'Día 3 — Prioridad nº1', day: 3, emailKey: 'd3', color: '#CD796C' },
  { label: 'Día 6 — Extracto del libro', day: 6, emailKey: 'd6', color: '#3D9A5F' },
  { label: 'Día 10 — Tu Evolución', day: 10, emailKey: 'd10', color: '#3D9A5F' },
  { label: 'Día 30 — Reevaluación', day: 30, emailKey: 'd30', color: '#edd274' },
  { label: 'Día 91 — Trimestral', day: 91, emailKey: 'd90', color: '#edd274' },
]

const LABELS: Record<string, string> = {
  archetype: 'Mecanismo de defensa',
  fearsNeeds: 'Miedos y necesidades',
  priorityDeep: 'Prioridad en profundidad',
  bookExcerpt: 'Extracto del libro',
  evolution: 'Evolución',
  nextQuarterly: 'Próxima reevaluación',
}

interface PdfInfo {
  exists: boolean
  path?: string
  updatedAt?: string
  fileName?: string
  fileSize?: number | null
}

export default function ToolsPage() {
  const [hash, setHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvolutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Email preview
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null)
  const [emailLoading, setEmailLoading] = useState(false)

  // PDF state
  const [pdfInfo, setPdfInfo] = useState<PdfInfo | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  // Load PDF info on mount
  useEffect(() => {
    async function loadPdfInfo() {
      try {
        const res = await fetch('/api/admin/book-excerpt')
        if (res.ok) {
          const data = await res.json()
          setPdfInfo(data)
        }
      } catch {
        // Silent
      }
    }
    loadPdfInfo()
  }, [])

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPdfLoading(true)
    setPdfError(null)
    setPdfSuccess(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/book-excerpt', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setPdfError(data.error ?? 'Error subiendo PDF')
      } else {
        setPdfSuccess('PDF subido correctamente')
        setPdfInfo({ exists: true, path: data.path, fileName: file.name })
      }
    } catch {
      setPdfError('Error de conexión')
    }
    setPdfLoading(false)
    e.target.value = ''
  }

  async function handlePdfDelete() {
    setPdfLoading(true)
    setPdfError(null)
    setPdfSuccess(null)

    try {
      const res = await fetch('/api/admin/book-excerpt', { method: 'DELETE' })
      if (res.ok) {
        setPdfInfo({ exists: false })
        setPdfSuccess('PDF eliminado')
      } else {
        setPdfError('Error eliminando PDF')
      }
    } catch {
      setPdfError('Error de conexión')
    }
    setPdfLoading(false)
  }

  async function jumpToDay(targetDay: number, emailKey: string) {
    setActiveDay(targetDay)
    setEmailPreview(null)

    // Load email preview
    setEmailLoading(true)
    try {
      const res = await fetch(`/api/admin/email-preview?day=${emailKey}`)
      if (res.ok) {
        const data = await res.json()
        setEmailPreview(data)
      }
    } catch {
      // Silent
    }
    setEmailLoading(false)

    // If hash provided, fast-forward to that day
    if (hash.trim()) {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/admin/fast-forward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash: hash.trim(), targetDay }),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error ?? 'Error desconocido')
        } else {
          setResult(data)
        }
      } catch {
        setError('Error de conexión')
      }

      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ maxWidth: '600px', opacity: mounted ? 1 : 0, transition: 'opacity 200ms ease-out' }}>
        <h1
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-h2)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Simulador de progresión
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-tertiary)',
            lineHeight: 'var(--lh-body-sm)',
            marginBottom: 'var(--space-8)',
          }}
        >
          Haz click en cualquier día para previsualizar el comunicado programado.
          Si introduces un hash, el mapa se ajusta a ese día para verlo en contexto.
        </p>

        {/* Hash input */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-caption)',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.02em',
              marginBottom: 'var(--space-2)',
            }}
          >
            Hash de la evaluación (opcional — para simular en un mapa real)
          </label>
          <input
            type="text"
            value={hash}
            onChange={(e) => setHash(e.target.value)}
            placeholder="ej: a1b2c3d4e5f6"
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: 'var(--border-interactive)',
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'monospace',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Day navigation */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-caption)',
              color: 'var(--color-text-tertiary)',
              letterSpacing: '0.02em',
              marginBottom: 'var(--space-3)',
            }}
          >
            Haz click en cualquier día para ver el comunicado:
          </p>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {DAY_PRESETS.map((preset) => {
              const isActive = activeDay === preset.day
              return (
                <button
                  key={preset.day}
                  onClick={() => jumpToDay(preset.day, preset.emailKey)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 'var(--space-4) var(--space-5)',
                    borderRadius: 'var(--radius-lg)',
                    border: isActive
                      ? `2px solid ${preset.color}`
                      : `1px solid ${preset.color}33`,
                    backgroundColor: isActive
                      ? `${preset.color}15`
                      : `${preset.color}0A`,
                    color: preset.color,
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: isActive ? 700 : 500,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.4 : 1,
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all var(--transition-base)',
                  }}
                >
                  <span>{preset.label}</span>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                  }}>
                    {isActive && (
                      <span style={{
                        fontSize: 'var(--text-caption)',
                        fontWeight: 600,
                        color: preset.color,
                        background: `${preset.color}20`,
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}>
                        Activo
                      </span>
                    )}
                    <span style={{
                      color: 'var(--color-text-tertiary)',
                      fontSize: 'var(--text-caption)',
                    }}>
                      día {preset.day}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(196,64,64,0.08)',
              border: '1px solid rgba(196,64,64,0.2)',
              color: 'var(--color-error)',
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {error}
          </div>
        )}

        {/* Email Preview */}
        {activeDay !== null && (
          <div
            style={{
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: 'var(--border-subtle)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-caption)',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#CD796C',
                marginBottom: 'var(--space-3)',
              }}
            >
              Comunicado — Día {activeDay}
            </p>

            {emailLoading ? (
              <p style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-tertiary)',
              }}>
                Cargando...
              </p>
            ) : emailPreview ? (
              <div>
                {/* Subject */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 'var(--space-1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Asunto
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 600,
                    color: 'var(--color-text-primary)',
                    margin: 0,
                  }}>
                    {emailPreview.subject}
                  </p>
                </div>

                {/* Body */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 'var(--space-1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Cuerpo
                  </p>
                  <div style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-bg-primary)',
                    border: 'var(--border-subtle)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-host-grotesk)',
                      fontSize: 'var(--text-body-sm)',
                      lineHeight: 'var(--lh-body)',
                      color: 'var(--color-text-primary)',
                      margin: 0,
                      whiteSpace: 'pre-line',
                    }}>
                      {emailPreview.bodyContent || '(Contenido dinámico — generado con datos del usuario)'}
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <p style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-text-tertiary)',
                    marginBottom: 'var(--space-1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}>
                    Botón CTA
                  </p>
                  <div style={{
                    display: 'inline-block',
                    padding: 'var(--space-3) var(--space-5)',
                    borderRadius: 'var(--radius-pill)',
                    background: 'var(--color-accent)',
                    color: '#FFFFFF',
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-body-sm)',
                    fontWeight: 500,
                  }}>
                    {emailPreview.ctaText}
                  </div>
                </div>

                {/* Dynamic note */}
                {emailPreview.isDynamic && emailPreview.dynamicNote && (
                  <p style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-text-tertiary)',
                    fontStyle: 'italic',
                    margin: 0,
                    lineHeight: 'var(--lh-body-sm)',
                  }}>
                    ℹ️ {emailPreview.dynamicNote}
                  </p>
                )}

                {/* Override indicator */}
                {emailPreview.hasOverride && (
                  <p style={{
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                    color: 'var(--color-success)',
                    fontWeight: 600,
                    marginTop: 'var(--space-2)',
                  }}>
                    ✓ Personalizado (tiene override en email_templates)
                  </p>
                )}
              </div>
            ) : (
              <p style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-text-tertiary)',
              }}>
                No se pudo cargar la previsualización
              </p>
            )}
          </div>
        )}

        {/* Current state (when hash is provided and result exists) */}
        {result && (
          <div
            style={{
              padding: 'var(--space-5)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: 'var(--border-subtle)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-caption)',
                color: 'var(--color-text-tertiary)',
                letterSpacing: '0.02em',
                marginBottom: 'var(--space-3)',
              }}
            >
              Estado del mapa: {result.daysSinceCreation} días desde creación
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-2)',
              }}
            >
              {Object.entries(result.evolution).map(([key, unlocked]) => (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: unlocked ? 'var(--color-success)' : 'rgba(38,66,51,0.15)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: unlocked ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                    }}
                  >
                    {LABELS[key] ?? key}
                  </span>
                </div>
              ))}
            </div>

            <a
              href={`/mapa/${hash.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                marginTop: 'var(--space-4)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-success)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all var(--transition-base)',
              }}
            >
              Ver mapa →
            </a>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SECCIÓN: Extracto del Libro (PDF)
            ══════════════════════════════════════════════════════════════ */}
        <div
          style={{
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-8)',
            borderTop: 'var(--border-subtle)',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-h3)',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)',
            }}
          >
            Extracto del Libro (PDF)
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-text-tertiary)',
              lineHeight: 'var(--lh-body-sm)',
              marginBottom: 'var(--space-6)',
            }}
          >
            Sube el PDF con la introducción y capítulo 1 del libro. Los usuarios
            lo podrán descargar desde su mapa. Si no hay PDF, la sección no aparece.
          </p>

          {/* Estado actual */}
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-bg-secondary)',
              border: 'var(--border-subtle)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: pdfInfo?.exists ? 'var(--color-success)' : 'rgba(38,66,51,0.15)',
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {pdfInfo?.exists
                  ? `PDF activo: ${pdfInfo.fileName ?? pdfInfo.path}`
                  : 'Sin PDF subido'}
              </span>
            </div>
            {pdfInfo?.updatedAt && (
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  color: 'var(--color-text-tertiary)',
                  marginTop: 'var(--space-1)',
                  marginLeft: '20px',
                }}
              >
                Actualizado: {new Date(pdfInfo.updatedAt).toLocaleDateString('es-ES', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            )}
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3) var(--space-5)',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-accent)',
                color: '#FFFFFF',
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 500,
                cursor: pdfLoading ? 'not-allowed' : 'pointer',
                opacity: pdfLoading ? 0.5 : 1,
                transition: 'all var(--transition-base)',
              }}
            >
              {pdfInfo?.exists ? 'Reemplazar PDF' : 'Subir PDF'}
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                disabled={pdfLoading}
                style={{ display: 'none' }}
              />
            </label>

            {pdfInfo?.exists && (
              <button
                onClick={handlePdfDelete}
                disabled={pdfLoading}
                style={{
                  padding: 'var(--space-3) var(--space-5)',
                  borderRadius: 'var(--radius-pill)',
                  border: '1px solid rgba(196,64,64,0.3)',
                  backgroundColor: 'transparent',
                  color: 'var(--color-error)',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 500,
                  cursor: pdfLoading ? 'not-allowed' : 'pointer',
                  opacity: pdfLoading ? 0.5 : 1,
                }}
              >
                Eliminar PDF
              </button>
            )}
          </div>

          {/* Feedback */}
          {pdfError && (
            <p style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-error)',
              marginTop: 'var(--space-3)',
            }}>
              {pdfError}
            </p>
          )}
          {pdfSuccess && (
            <p style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-success)',
              marginTop: 'var(--space-3)',
            }}>
              {pdfSuccess}
            </p>
          )}

          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-caption)',
              color: 'var(--color-text-tertiary)',
              marginTop: 'var(--space-4)',
              lineHeight: 'var(--lh-body-sm)',
            }}
          >
            El texto de la CTA de descarga se puede editar desde la sección de Copy
            (pestaña Mapa {'>'} subsección bookDownload).
          </p>
        </div>
      </div>
    </AdminLayout>
  )
}
