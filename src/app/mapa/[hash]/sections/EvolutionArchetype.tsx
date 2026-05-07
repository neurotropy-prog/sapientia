'use client'

/**
 * EvolutionArchetype.tsx — Sección Día 0: Mecanismo de defensa adaptativo
 *
 * D3 (feedback Javi): Solo muestra narrativa + creencias + herida/armadura.
 * Los miedos, 3 capas de necesidad y patrones de burnout se muestran
 * en FearsNeedsModule.tsx (desbloqueado en Día 1).
 */

import { useMemo } from 'react'
import Badge from '@/components/ui/Badge'
import type { ArchetypeData } from '@/lib/content/archetypes'

// ─── MARKER HIGHLIGHT (same as DefenseReveal) ────────────────────────────────
const MARKER_STYLE: React.CSSProperties = {
  background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)',
  margin: '-2px -6px',
  padding: '2px 6px',
}

const HIGHLIGHTS: Record<string, string[]> = {
  esceptico: ['tu vulnerabilidad como munición', 'confiar es el preludio del daño', 'la vulnerabilidad siempre vino acompañada de dolor'],
  obsesivo: ['ese algo te destrozó', 'nunca más serás sorprendido', 'una cárcel de escenarios que nunca suceden'],
  perfeccionista: ['el amor, la aceptación o la seguridad no eran gratuitos, se ganaban con resultados', 'mi valor depende de mi rendimiento', 'eres suficiente sin tener que hacer absolutamente nada'],
  dependiente: ['existir solo no era seguro', 'solo no puedo, sin el otro me desintegro', 'puedes sostenerte solo'],
  sumiso: ['tener voz era peligroso', 'si me someto, sobrevivo', 'ni siquiera la vives como pérdida'],
  autosuficiente: ['esa persona no estuvo', 'necesitar duele más que no tener', 'le ha prohibido hacerlo para siempre'],
  arrogante: ['alguien te hizo sentir pequeño', 'si estoy arriba nadie me alcanza', 'esa distancia que interpretas como victoria'],
}

function applyHighlights(text: string, phrases: string[]): React.ReactNode {
  if (!phrases.length) return text
  const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(regex)
  return parts.map((part, i) => {
    const isHighlight = phrases.some(p => part.toLowerCase() === p.toLowerCase())
    if (isHighlight) {
      return <mark key={i} style={{ ...MARKER_STYLE, color: 'inherit' }}>{part}</mark>
    }
    return part
  })
}

interface Props {
  archetype: ArchetypeData
  isNew: boolean
  mode?: 'summary' | 'full'
  onExpandRequest?: () => void
}

export default function EvolutionArchetype({ archetype, isNew, mode = 'full', onExpandRequest }: Props) {
  // ── SUMMARY MODE ──
  if (mode === 'summary') {
    return (
      <div
        className="mapa-fade-up"
        style={{
          background: 'var(--color-bg-secondary)',
          borderLeft: '3px solid var(--color-accent)',
          borderRadius: '0 var(--radius-lg) var(--radius-lg) 0',
          padding: 'var(--space-6)',
        }}
      >
        {/* Tag */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-caption)',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase' as const,
            color: 'var(--color-accent)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {isNew ? 'NUEVO DESDE TU ÚLTIMA VISITA' : 'TU MECANISMO DE DEFENSA ADAPTATIVO'}
        </p>

        {/* Overline */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-overline)',
            letterSpacing: 'var(--ls-overline)',
            textTransform: 'uppercase' as const,
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-4)',
          }}
        >
          Mecanismo de defensa adaptativo
        </p>

        {/* Archetype name */}
        <h3
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-h3)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1.3,
            marginBottom: 'var(--space-3)',
          }}
        >
          {archetype.name}
        </h3>

        {/* Impact phrase (teaser) */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body)',
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: 'var(--color-text-secondary)',
            maxWidth: '42rem',
            marginBottom: 'var(--space-5)',
          }}
        >
          {archetype.teaser}
        </p>

        {/* CTA */}
        {onExpandRequest && (
          <button
            onClick={onExpandRequest}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              fontWeight: 500,
              color: 'var(--color-accent)',
              cursor: 'pointer',
              padding: 0,
              transition: 'opacity var(--transition-base)',
            }}
          >
            Descubrir tu mecanismo de defensa completo →
          </button>
        )}
      </div>
    )
  }

  // ── FULL MODE ──
  // Dividir la narrativa en párrafos
  const narrativeParagraphs = archetype.narrative.split('\n\n')
  const highlights = useMemo(() => HIGHLIGHTS[archetype.key] ?? [], [archetype.key])

  return (
    <div
      className="mapa-fade-up"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        border: 'var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-6)',
      }}
    >
      {/* Badge */}
      {isNew && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Badge status="nuevo">NUEVO</Badge>
        </div>
      )}

      {/* Overline */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: '0.875rem',
          letterSpacing: 'var(--ls-overline)',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: 'var(--color-accent)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Tu mecanismo de defensa
      </p>

      {/* Nombre */}
      <h3
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-h2)',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--lh-h2)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {archetype.name}
      </h3>

      {/* Descriptores */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 600,
          color: '#4875dc',
          marginBottom: 'var(--space-4)',
        }}
      >
        {archetype.descriptors}
      </p>

      {/* ── Narrativa (el espejo) ── */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        {narrativeParagraphs.map((paragraph, i) => (
          <p
            key={i}
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body)',
              lineHeight: 'var(--lh-body)',
              color: 'var(--color-text-primary)',
              fontWeight: i === 0 ? 700 : 400,
              marginBottom:
                i < narrativeParagraphs.length - 1
                  ? 'var(--space-4)'
                  : '0',
            }}
          >
            {applyHighlights(paragraph, highlights)}
          </p>
        ))}
      </div>

      {/* ── Creencia central ── */}
      <div
        style={{
          borderLeft: '2px solid var(--color-error)',
          paddingLeft: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-overline)',
            letterSpacing: 'var(--ls-overline)',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          Creencia central
        </p>
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-text-primary)',
            fontWeight: 500,
          }}
        >
          &ldquo;{archetype.centralBelief}&rdquo;
        </p>
      </div>

      {/* ── Creencia de sanación ── */}
      <div
        style={{
          borderLeft: '2px solid var(--color-accent)',
          paddingLeft: 'var(--space-4)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-overline)',
            letterSpacing: 'var(--ls-overline)',
            textTransform: 'uppercase',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          Creencia de sanación
        </p>
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-accent)',
            fontWeight: 500,
          }}
        >
          &ldquo;{archetype.healingBelief}&rdquo;
        </p>
      </div>

      {/* Herida + Armadura + Estado SN */}
      <div
        style={{
          backgroundColor: 'rgba(38,66,51,0.03)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Herida de la {archetype.wound.toLowerCase()} → Armadura de{' '}
          {archetype.armor.toLowerCase()}.
        </p>
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            color: '#CD796C',
            borderTop: '1px solid rgba(205, 121, 108, 0.2)',
            paddingTop: 'var(--space-2)',
          }}
        >
          {archetype.snState.charAt(0).toUpperCase() + archetype.snState.slice(1)}.
        </p>
      </div>

      {/* D3: Miedos, necesidades y patrones ahora se muestran en FearsNeedsModule (Día 1+) */}
    </div>
  )
}
