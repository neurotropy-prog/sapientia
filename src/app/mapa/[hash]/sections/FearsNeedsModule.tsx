'use client'

/**
 * FearsNeedsModule.tsx — Módulo "MIEDOS + NECESIDADES NUCLEARES" (Día 1+)
 *
 * Referencia visual: Tu_mapa_paso_2.png, captura 12.54.24 (feedback Javi 01-abr-2026)
 *
 * D2/D3: Contenido que se desbloquea en Día 1. Separado del mecanismo de defensa (Día 0).
 * Incluye: miedos principales, 3 capas de necesidad, patrones de burnout.
 *
 * Diseño:
 * - Contenedor: fondo verde claro con borde izquierdo coral grueso
 * - Título: "MIEDOS + NECESIDADES NUCLEARES" (coral, uppercase, tracking)
 * - 3 acordeones: miedos (expandido por defecto), necesidades, patrones
 */

import { useState } from 'react'
import type { ArchetypeData } from '@/lib/content/archetypes'

interface FearsNeedsModuleProps {
  archetype: ArchetypeData
  isNew: boolean
  /** When true, all accordions start collapsed (used in FocusBanner) */
  allCollapsed?: boolean
}

// ─── Accordion button style helper ───────────────────────────────────────────

function AccordionButton({
  label,
  open,
  onClick,
  isFirst,
}: {
  label: string
  open: boolean
  onClick: () => void
  isFirst?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
        border: 'none',
        borderTop: isFirst ? 'none' : '1px solid rgba(38, 66, 51, 0.08)',
        fontFamily: 'var(--font-host-grotesk)',
        fontSize: 'var(--text-body-sm)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        cursor: 'pointer',
        padding: 'var(--space-4) 0',
        textAlign: 'left',
        transition: 'color var(--transition-base)',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 200ms ease',
          fontSize: '16px',
          color: 'var(--color-text-tertiary)',
        }}
      >
        ↓
      </span>
    </button>
  )
}

// ─── Need layer section ──────────────────────────────────────────────────────

function NeedLayerSection({
  layer,
  urgencyLabel,
  accentColor,
}: {
  layer: { title: string; items: string[]; explanation: string }
  urgencyLabel: string
  accentColor: string
}) {
  return (
    <div
      style={{
        marginBottom: 'var(--space-5)',
        paddingLeft: 'var(--space-4)',
        borderLeft: `2px solid ${accentColor}`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          marginBottom: 'var(--space-2)',
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
          {layer.title}
        </span>
        <span
          style={{
            display: 'inline-block',
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-caption)',
            fontWeight: 600,
            color: '#fff',
            background: accentColor,
            padding: '1px 8px',
            borderRadius: '4px',
          }}
        >
          {urgencyLabel}
        </span>
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '0 0 var(--space-2) 0',
        }}
      >
        {layer.items.map((item) => (
          <li
            key={item}
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-1)',
            }}
          >
            · {item}{/[.!?]$/.test(item.trim()) ? '' : '.'}
          </li>
        ))}
      </ul>
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          lineHeight: 'var(--lh-body)',
          color: '#c27d70',
        }}
      >
        {layer.explanation}
      </p>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export default function FearsNeedsModule({ archetype, isNew, allCollapsed }: FearsNeedsModuleProps) {
  const [fearsOpen, setFearsOpen] = useState(!allCollapsed)
  const [needsOpen, setNeedsOpen] = useState(false)
  const [patternsOpen, setPatternsOpen] = useState(false)

  return (
    <div
      className="mapa-fade-up"
      style={{
        backgroundColor: 'rgba(232, 244, 238, 0.5)',
        borderLeft: '4px solid #CD796C',
        borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
        padding: 'var(--space-6)',
      }}
    >
      {/* ── Título ── */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#CD796C',
          margin: 0,
          marginBottom: 'var(--space-2)',
        }}
      >
        Miedos + necesidades nucleares
      </p>

      {/* ── Separador ── */}
      <div
        style={{
          height: '1px',
          background: 'rgba(38, 66, 51, 0.08)',
          marginBottom: 'var(--space-2)',
        }}
      />

      {/* ── Acordeón 1: Miedos principales (expandido por defecto) ── */}
      <AccordionButton
        label="Tus miedos principales:"
        open={fearsOpen}
        onClick={() => setFearsOpen((o) => !o)}
        isFirst
      />

      {fearsOpen && (
        <div style={{ paddingBottom: 'var(--space-3)', paddingLeft: 'var(--space-3)' }}>
          {archetype.fears.map((fear) => (
            <p
              key={fear}
              style={{
                fontFamily: 'var(--font-host-grotesk)',
                fontSize: 'var(--text-body-sm)',
                lineHeight: 'var(--lh-body)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)',
              }}
            >
              · {fear}{/[.!?]$/.test(fear.trim()) ? '' : '.'}
            </p>
          ))}
        </div>
      )}

      {/* ── Acordeón 2: Tus 3 capas de necesidad ── */}
      <AccordionButton
        label="Tus 3 capas de necesidad:"
        open={needsOpen}
        onClick={() => setNeedsOpen((o) => !o)}
      />

      {needsOpen && (
        <div style={{ paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-2)' }}>
          {/* Bioquímica (más urgente) */}
          <NeedLayerSection
            layer={archetype.needs.biochemical}
            urgencyLabel="Más urgente"
            accentColor="var(--color-error)"
          />
          {/* Sistema Nervioso */}
          <NeedLayerSection
            layer={archetype.needs.nervousSystem}
            urgencyLabel="Plataforma"
            accentColor="var(--color-accent)"
          />
          {/* Emocional (más profunda) */}
          <NeedLayerSection
            layer={archetype.needs.emotional}
            urgencyLabel="Más profunda"
            accentColor="var(--color-success)"
          />
        </div>
      )}

      {/* ── Acordeón 3: Tus patrones de burnout ── */}
      <AccordionButton
        label="Tus patrones de burnout:"
        open={patternsOpen}
        onClick={() => setPatternsOpen((o) => !o)}
      />

      {patternsOpen && (
        <div style={{ paddingTop: 'var(--space-3)', paddingBottom: 'var(--space-2)' }}>
          {archetype.patterns.map((p) => (
            <div key={p.name} style={{ marginBottom: 'var(--space-4)' }}>
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                {p.name}{/[:.]$/.test(p.name.trim()) ? '' : ':'}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 'var(--lh-body)',
                  color: 'var(--color-text-primary)',
                }}
              >
                {p.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
