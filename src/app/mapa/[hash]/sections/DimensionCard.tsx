'use client'

/**
 * DimensionCard.tsx — Card de dimensión individual (extraída de MapaClient)
 *
 * Renderiza una dimensión con su nombre, score, barra.
 * El insight y contenido adicional se despliegan al hacer clic.
 */

import { useState } from 'react'
import { useCopy } from '@/lib/copy'
import Badge from '@/components/ui/Badge'
import type { DimensionResult, DimensionKey } from '@/lib/insights'

interface SubdimensionScore {
  key: string
  name: string
  score: number
}

interface Props {
  dim: DimensionResult
  isMostCompromised: boolean
  showPriorityTag: boolean
  /** Insight D7 nuevo (solo en la dimensión más comprometida) */
  d7Insight?: string | null
  d7IsNew?: boolean
  /** Subdimensiones completadas */
  subdimensionScores?: SubdimensionScore[] | null
  /** Start expanded */
  defaultOpen?: boolean
}

export default function DimensionCard({
  dim,
  isMostCompromised,
  showPriorityTag,
  d7Insight,
  d7IsNew,
  subdimensionScores,
  defaultOpen = false,
}: Props) {
  const { getCopy } = useCopy()
  const isD2 = dim.key === 'd2'
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className={`mapa-fade-up${showPriorityTag ? ' mapa-priority' : ''}`}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: showPriorityTag
          ? `1px solid ${dim.color}33`
          : 'var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* ── Header clicable ── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: 'var(--space-6)',
          paddingBottom: open ? 'var(--space-3)' : 'var(--space-6)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'block',
        }}
      >
        {/* Tags */}
        {(showPriorityTag || isD2 || d7IsNew) && (
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
              marginBottom: 'var(--space-3)',
            }}
          >
            {showPriorityTag && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: `${dim.color}18`,
                  color: dim.color,
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {getCopy('mapa.dimension.priority')}
              </span>
            )}
            {isD2 && (
              <span
                style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'rgba(61,154,95,0.1)',
                  color: 'var(--color-success)',
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  fontWeight: 500,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {getCopy('mapa.dimension.improvable72h')}
              </span>
            )}
            {d7IsNew && <Badge status="actualizado">ACTUALIZADO</Badge>}
          </div>
        )}

        {/* Nombre + score + chevron */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-3)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-h4)',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--lh-h4)',
            }}
          >
            {dim.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-h3)',
                fontWeight: 700,
                color: dim.color,
                lineHeight: 1,
              }}
            >
              {dim.score}
              <span
                style={{
                  fontSize: 'var(--text-caption)',
                  fontWeight: 400,
                  color: 'var(--color-text-tertiary)',
                }}
              >
                /100
              </span>
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              style={{
                transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
                flexShrink: 0,
              }}
            >
              <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Barra semáforo — siempre visible */}
        <div
          style={{
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(38,66,51,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            className="mapa-bar-fill"
            style={{ width: `${dim.score}%`, background: dim.color }}
          />
        </div>
      </button>

      {/* ── Contenido desplegable ── */}
      <div
        style={{
          maxHeight: open ? '800px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 300ms ease',
        }}
      >
        <div style={{ padding: '0 var(--space-6) var(--space-6)' }}>
          {/* Insight original */}
          <p
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--color-text-secondary)',
              marginTop: 'var(--space-3)',
            }}
          >
            {dim.insight}
          </p>

          {/* Insight D7 — dato nuevo */}
          {d7Insight && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(205,121,108,0.06)',
                border: '1px solid rgba(205,121,108,0.12)',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 'var(--lh-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {d7Insight}
              </p>
            </div>
          )}

          {/* Subdimensiones completadas */}
          {subdimensionScores && subdimensionScores.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              {subdimensionScores.map((sub) => (
                <div key={sub.key} style={{ marginBottom: 'var(--space-3)' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--space-1)',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-host-grotesk)',
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text-primary)',
                      }}
                    >
                      {sub.name}:
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-host-grotesk)',
                        fontSize: 'var(--text-caption)',
                        fontWeight: 500,
                        color: dim.color,
                      }}
                    >
                      {sub.score}/100
                    </span>
                  </div>
                  <div
                    style={{
                      height: '3px',
                      borderRadius: '2px',
                      background: 'rgba(38,66,51,0.06)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${sub.score}%`,
                        height: '100%',
                        borderRadius: '2px',
                        background: dim.color,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
