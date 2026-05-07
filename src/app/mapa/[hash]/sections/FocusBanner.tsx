'use client'

/**
 * FocusBanner.tsx — Visit-aware focus component for Zona 2
 *
 * Determines WHAT to show on return visits based on priority logic:
 * 1. NEW content since lastVisitedAt (archetype > d7Insight > session > subdimensions > bookExcerpt > reevaluation)
 * 2. PENDING action (session not booked, subdimensions not completed, reevaluation available)
 * 3. User hasn't paid → "Tu camino" teaser
 * 4. Default → next unlock teaser
 */

import Button from '@/components/ui/Button'
import EvolutionArchetype from './EvolutionArchetype'
import FearsNeedsModule from './FearsNeedsModule'
import type { EvolutionState } from '@/lib/map-evolution'
import type { ArchetypeData } from '@/lib/content/archetypes'
import type { SubdimensionConfig } from '@/lib/content/subdimensions'
import type { BookExcerptData } from '@/lib/content/book-excerpts'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface FocusBannerProps {
  evolution: EvolutionState
  lastVisitedAt: string
  archetype: ArchetypeData | null
  d7Insight: string | null
  subdimensionConfig: SubdimensionConfig | null
  bookExcerpt: BookExcerptData | null
  worstDimensionName: string
  worstScore: number
  hasPaid: boolean
  hash: string
  daysSinceCreation: number
}

interface FocusItem {
  tag: string
  title: string
  description: React.ReactNode
  ctaText: string
  scrollTo: string
}

// ─── MILESTONES (días de desbloqueo) ─────────────────────────────────────────

const UNLOCK_DAYS: Record<string, number> = {
  archetype: 0,
  fearsNeeds: 1,
  priorityDeep: 3,
  bookExcerpt: 6,
  evolution: 10,
  quarterly: 90,
}

// ─── FOCUS SELECTION ─────────────────────────────────────────────────────────

export function selectFocus(props: FocusBannerProps): FocusItem {
  const { evolution, archetype, d7Insight, subdimensionConfig, bookExcerpt, worstDimensionName, worstScore, hasPaid, daysSinceCreation } = props

  // Helper: "TU SIGUIENTE PASO" card for free users
  const siguientePaso: FocusItem = {
    tag: 'TU SIGUIENTE PASO',
    title: 'Empieza la Semana 1 del Programa de neuroregulación L.A.R.S.©',
    description: <>Un entrenamiento de <mark style={{ background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)', margin: '-2px -6px', padding: '2px 6px', color: 'inherit' }}>Liderazgo de Alto Rendimiento Sostenible</mark> de 12 semanas <strong>liderado por médicos y psicoterapeutas.</strong> Los primeros cambios llegan en menos de 72h. con el incremento sustancial en tu descanso.</>,
    ctaText: 'Los detalles',
    scrollTo: 'zona-camino',
  }

  // 0. Day 0 FREE users — "TU SIGUIENTE PASO" (no new content to show yet)
  if (!hasPaid && daysSinceCreation === 0) {
    return siguientePaso
  }

  // 1. NEW content — most recently unlocked first (newest day wins)
  //    Order: reevaluation (D10+) > bookExcerpt (D6) > priorityDeep (D3) > fearsNeeds (D1) > archetype (D0)

  if (evolution.reevaluation.isNew || evolution.nextQuarterlyUnlocked) {
    return {
      tag: `HAN PASADO ${daysSinceCreation} DÍAS`,
      title: '¿Ha cambiado algo en tu regulación?',
      description: 'Responde las mismas 10 preguntas y compara con tu día 0.',
      ctaText: 'Reevaluar mi estado',
      scrollTo: 'section-reevaluation',
    }
  }

  if (evolution.bookExcerpt.isNew && bookExcerpt) {
    return {
      tag: 'PARA TI',
      title: 'Un capítulo escrito para tu patrón',
      description: `Contenido personalizado para personas con tu perfil de ${worstDimensionName.toLowerCase()}.`,
      ctaText: 'Leer extracto',
      scrollTo: 'section-book',
    }
  }

  if (evolution.priorityDeep.isNew && subdimensionConfig) {
    return {
      tag: 'NUEVO DESDE TU ÚLTIMA VISITA',
      title: 'Profundizamos en tu prioridad nº1',
      description: `"${worstDimensionName}" tiene ${subdimensionConfig.subdimensions.length} capas más. 2 preguntas para afinar tu análisis.`,
      ctaText: 'Responder ahora',
      scrollTo: 'section-subdimensions',
    }
  }

  if (evolution.fearsNeeds.isNew && archetype) {
    return {
      tag: 'NUEVO DESDE TU ÚLTIMA VISITA',
      title: 'Miedos + necesidades nucleares',
      description: 'Tus miedos principales, capas de necesidad y patrones de burnout.',
      ctaText: 'Ver en detalle',
      scrollTo: 'section-fears-needs',
    }
  }

  if (evolution.archetype.isNew && archetype) {
    return {
      tag: 'NUEVO DESDE TU ÚLTIMA VISITA',
      title: `Tu mecanismo de defensa: ${archetype.name}`,
      description: archetype.teaser,
      ctaText: 'Descubrir tu mecanismo de defensa completo',
      scrollTo: 'section-archetype',
    }
  }

  if (evolution.insightD7.isNew && d7Insight) {
    return {
      tag: 'TU MAPA SE HA ACTUALIZADO',
      title: `${worstDimensionName} — ${worstScore}/100`,
      description: d7Insight,
      ctaText: 'Ver tu evaluación completa',
      scrollTo: 'section-dimensions',
    }
  }

  // 2. PENDING actions
  if (evolution.subdimensions.unlocked && !evolution.subdimensions.completed) {
    return {
      tag: 'PENDIENTE',
      title: 'Profundiza tu evaluación',
      description: `Tu ${worstDimensionName.toLowerCase()} tiene capas que no pudimos medir. 2 preguntas más.`,
      ctaText: 'Responder ahora',
      scrollTo: 'section-subdimensions',
    }
  }

  if (evolution.reevaluation.unlocked && !evolution.reevaluation.completed) {
    return {
      tag: 'DISPONIBLE',
      title: 'Tu reevaluación está lista',
      description: 'Compara tu estado actual con tu día 0. Verás cuánto ha cambiado.',
      ctaText: 'Reevaluar mi estado',
      scrollTo: 'section-reevaluation',
    }
  }

  // 3. FREE users with no new/pending content — still show "TU SIGUIENTE PASO"
  if (!hasPaid) {
    return siguientePaso
  }

  // 4. Default — next unlock teaser (paid users only reach here)
  const nextUnlock = Object.entries(UNLOCK_DAYS).find(
    ([, day]) => day > daysSinceCreation
  )
  const daysRemaining = nextUnlock ? nextUnlock[1] - daysSinceCreation : null

  return {
    tag: 'TU MAPA EVOLUCIONA',
    title: daysRemaining
      ? `Próximo desbloqueo en ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}`
      : 'Tu mapa sigue activo',
    description: daysRemaining
      ? 'Cada semana aparece algo nuevo. Vuelve cuando quieras.'
      : 'Todas las secciones están desbloqueadas. Explora tu mapa completo.',
    ctaText: 'Ver mapa completo',
    scrollTo: 'mapa-completo',
  }
}

// ─── COMPONENTE ──────────────────────────────────────────────────────────────

export default function FocusBanner(props: FocusBannerProps) {
  const { evolution, archetype, subdimensionConfig } = props
  const focus = selectFocus(props)

  const SCROLL_TO_ACCORDION: Record<string, string> = {
    'section-archetype': 'identidad',
    'section-fears-needs': 'miedos-necesidades',
    'section-session': 'sesion',
    'section-subdimensions': 'profundidad',
    'section-book': 'libro',
    'section-reevaluation': 'evolucion',
    'section-dimensions': 'evaluacion',
    'mapa-completo': 'evaluacion',
  }

  const handleCTA = () => {
    const accordionId = SCROLL_TO_ACCORDION[focus.scrollTo]
    // Open the accordion section via custom event
    if (accordionId) {
      window.dispatchEvent(new CustomEvent('accordion:open', { detail: accordionId }))
    }
    const el = accordionId
      ? document.getElementById(`section-accordion-${accordionId}`)
      : document.getElementById(focus.scrollTo)
    if (el) {
      // Small delay to let accordion open before scrolling
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }
  }

  // Render specialized components based on what selectFocus decided
  // This ensures the render ALWAYS matches selectFocus's priority decision
  if (focus.scrollTo === 'section-archetype' && archetype) {
    return (
      <EvolutionArchetype
        mode="summary"
        archetype={archetype}
        isNew={true}
        onExpandRequest={handleCTA}
      />
    )
  }

  if (focus.scrollTo === 'section-fears-needs' && archetype) {
    return (
      <FearsNeedsModule
        archetype={archetype}
        isNew={true}
      />
    )
  }

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
      <p style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontSize: focus.tag === 'TU SIGUIENTE PASO' ? 'calc(var(--text-overline) + 2px)' : 'var(--text-overline)',
        letterSpacing: 'var(--ls-overline)',
        textTransform: 'uppercase',
        fontWeight: focus.tag === 'TU SIGUIENTE PASO' ? 700 : 400,
        color: 'var(--color-accent)',
        marginBottom: 'var(--space-3)',
      }}>
        {focus.tag}
      </p>

      {/* Title */}
      <h3 style={{
        fontFamily: 'var(--font-plus-jakarta)',
        fontSize: 'var(--text-h3)',
        lineHeight: 'var(--lh-h3)',
        letterSpacing: 'var(--ls-h3)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--space-2)',
      }}>
        {focus.title}
      </h3>

      {/* Description */}
      <p style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontSize: 'var(--text-body-sm)',
        lineHeight: 'var(--lh-body-sm)',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--space-5)',
      }}>
        {focus.description}
      </p>

      {/* CTA */}
      <Button variant="ghost" size="small" onClick={handleCTA}>
        {focus.ctaText} →
      </Button>
    </div>
  )
}
