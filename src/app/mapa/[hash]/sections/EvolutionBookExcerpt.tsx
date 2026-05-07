'use client'

/**
 * EvolutionBookExcerpt.tsx — Sección Día 21: Extracto del libro
 *
 * Referencia visual: extracto_libro.png (feedback Javi 01-abr-2026)
 *
 * Muestra extracto del capítulo correspondiente a la dimensión
 * más comprometida. Incluye botón descarga + expandible inline.
 *
 * E2: Rediseño completo per mockup:
 * - Título completo del libro
 * - Subtítulo: "El sistema nervioso que no se apaga"
 * - Contexto con dimensión + score
 * - CTA principal: "DESCARGAR CAP.1 GRATIS" (coral solid)
 * - Link secundario: "Leer extracto ↓" (expandible)
 */

import { useState, useMemo } from 'react'
import Badge from '@/components/ui/Badge'
import type { BookExcerptData } from '@/lib/content/book-excerpts'
import type { DimensionKey } from '@/lib/insights'

// ─── MARKER HIGHLIGHTS ──────────────────────────────────────────────────────

const MARKER_STYLE: React.CSSProperties = {
  background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)',
  margin: '-2px -6px',
  padding: '2px 6px',
  color: 'inherit',
}

const HIGHLIGHTS: Record<DimensionKey, string[]> = {
  d1: [
    'Tu cuerpo tiene un sistema de emergencia diseñado para protegerte de las amenazas',
    'este sistema fue diseñado para emergencias puntuales que se resuelven en minutos, y tu vida profesional no permite que se apague nunca',
    'tu cerebro no distingue bien entre una amenaza real y una imaginada',
    'Tu mayor fortaleza profesional —la capacidad de anticipar, calcular, prever— es la que mantiene tu sistema de alarma permanentemente encendido',
    'la región del cerebro que te permite pensar estratégicamente se debilita mientras el centro del miedo se fortalece',
    'tu cerebro reasigna recursos de la diplomacia al ejército',
    'Las vacaciones no resuelven una desregulación del eje HPA',
    'están actuando sobre el efecto en lugar de la causa',
    'estos cambios son reversibles',
    'Tu sistema nervioso no está roto. Está atrapado en un modo que fue útil en su momento y que ahora necesita recalibrarse. Y eso se puede hacer.',
  ],
  d2: [
    'Es la ventana más crítica de regulación biológica que tiene tu organismo',
    'las emociones del día se acumulan sin procesar, y al día siguiente tu amígdala está más reactiva',
    'no duermes mal porque estás estresado; estás estresado, entre otras razones, porque duermes mal',
    'El sueño no es la consecuencia del burnout; es uno de sus motores principales',
    'Una sola noche de sueño reducido —seis horas en lugar de ocho— produce al día siguiente un aumento del sesenta por ciento en la reactividad de la amígdala',
    'Quien duerme seis horas regularmente está tomando decisiones con un cerebro funcionalmente intoxicado',
    'han normalizado la niebla mental, la irritabilidad y la fatiga como su nuevo normal',
    'No es higiene del sueño genérica. Es intervención de precisión sobre los mecanismos que el burnout ha saboteado',
    'es como si me hubieran quitado un velo de delante de los ojos',
    'La inversión con mayor retorno que puedes hacer cada día no está en tu oficina. Está en tu cama.',
  ],
  d3: [
    'No te has vuelto menos inteligente. No es falta de disciplina.',
    'la herramienta que usas para pensar estratégicamente está funcionando en un entorno hostil',
    'comprometiendo la neuroplasticidad y la capacidad de generar nuevas conexiones',
    'tu cerebro tiene un incendio de baja intensidad que nadie ha apagado',
    'la información está ahí pero no puedes acceder a ella con la velocidad que antes tenías',
    'No has perdido capacidad',
    'Reducir la inflamación no solo mejora tu ánimo: te devuelve la mente que necesitas para liderar',
    'cada síntoma cognitivo que sientes tiene una causa biológica concreta, medible y corregible',
    'la claridad no regresa poco a poco. Regresa de golpe. Como encender la luz en una habitación que llevaba meses a oscuras.',
  ],
  d4: [
    'Sabes que esa reacción no te representa',
    'No eres mala persona. Eres una buena persona con un sistema nervioso sobrecargado',
    'la parte del cerebro que te permite regular tus emociones está funcionando bajo mínimos, mientras que la parte que amplifica cada reacción está a tope',
    'El carácter aquí no falla. Es neurobiología. Y es reversible.',
    'Regular una emoción requiere una inversión energética que tu cuerpo agotado no puede permitirse',
    'No puedes gestionar mejor tus emociones cuando la infraestructura biológica que hace posible esa gestión está comprometida',
    'Es como pedirle a alguien que conduzca mejor cuando los frenos del coche están averiados',
    'la reactividad emocional disminuye sin necesidad de «trabajar» directamente sobre las emociones',
    '«has vuelto», dicen. Y lo que ha vuelto no es el autocontrol. Lo que ha vuelto es la biología que hace posible el autocontrol.',
  ],
  d5: [
    'No sentías tristeza exactamente. Sentías nada.',
    'Es la ausencia de la química que hace posible querer algo',
    'Puedo hacer las cosas, pero no quiero hacerlas',
    'Es como si la máquina funcionara pero el piloto se hubiera ido',
    'Cuando te anestesias ante el agotamiento, también te anestesias ante el amor, la belleza, la conexión',
    'Es como pisar el acelerador de un coche sin gasolina: más presión, cero resultado',
    'La alegría no se entrena. Se DESBLOQUEA',
    'la capacidad de sentir no se ha perdido. Está dormida',
    'Reaparece la persona que habías olvidado que existía. No un parche. Una restauración desde la raíz.',
  ],
}

function applyHighlights(text: string, phrases: string[]): React.ReactNode {
  if (!phrases.length) return text

  // Build regex from all phrases (escaped, case-insensitive)
  const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi')
  const parts = text.split(regex)

  if (parts.length === 1) return text

  return parts.map((part, i) => {
    const isHighlight = phrases.some(p => p.toLowerCase() === part.toLowerCase())
    if (isHighlight) {
      return <mark key={i} style={MARKER_STYLE}>{part}</mark>
    }
    return part
  })
}

interface Props {
  excerpt: BookExcerptData
  isNew: boolean
  worstDimensionName: string
  worstScore: number
}

export default function EvolutionBookExcerpt({
  excerpt,
  isNew,
  worstDimensionName,
  worstScore,
}: Props) {
  const [expanded, setExpanded] = useState(false)

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
          <Badge status="para_ti">PARA TI</Badge>
        </div>
      )}

      {/* Overline: referencia libro */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-overline)',
          letterSpacing: 'var(--ls-overline)',
          textTransform: 'uppercase',
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-2)',
        }}
      >
        Extracto Capítulo {excerpt.chapterNumber}
      </p>

      {/* Título del libro completo */}
      <h4
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-h4)',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--lh-h4)',
          marginBottom: 'var(--space-1)',
        }}
      >
        {excerpt.bookTitle}
      </h4>

      {/* Subtítulo capítulo */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body)',
          fontStyle: 'italic',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--space-4)',
        }}
      >
        {excerpt.chapterTitle}
      </p>

      {/* Contexto con dimensión comprometida */}
      <p
        style={{
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          lineHeight: 'var(--lh-body)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-5)',
        }}
      >
        Tu dimensión más comprometida (<strong>{worstDimensionName}: {worstScore}</strong>) se
        explica en profundidad aquí.
      </p>

      {/* CTA principal: Descargar capítulo */}
      <a
        href={excerpt.bookLink !== '#' ? excerpt.bookLink : '#'}
        target={excerpt.bookLink !== '#' ? '_blank' : undefined}
        rel={excerpt.bookLink !== '#' ? 'noopener noreferrer' : undefined}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'center',
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          fontWeight: 600,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: '#ffffff',
          background: '#CD796C',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-4) var(--space-6)',
          cursor: 'pointer',
          textDecoration: 'none',
          transition: 'opacity var(--transition-base)',
          marginBottom: 'var(--space-4)',
        }}
      >
        Descargar cap.{excerpt.chapterNumber} gratis
      </a>

      {/* Link secundario: Leer extracto inline */}
      <button
        onClick={() => setExpanded((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          background: 'transparent',
          border: 'none',
          fontFamily: 'var(--font-host-grotesk)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-accent)',
          cursor: 'pointer',
          padding: 'var(--space-2) 0',
          transition: 'color var(--transition-base)',
        }}
      >
        <span>{expanded ? 'Cerrar extracto' : 'Leer extracto'}</span>
        <span
          style={{
            display: 'inline-block',
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition-base)',
            fontSize: '14px',
          }}
        >
          ↓
        </span>
      </button>

      {/* Extracto expandible */}
      {expanded && (
        <div
          style={{
            padding: 'var(--space-4) 0 0',
            borderTop: 'var(--border-subtle)',
            marginTop: 'var(--space-2)',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontSize: 'var(--text-body-sm)',
              lineHeight: '1.7',
              color: 'var(--color-text-primary)',
            }}
          >
            {excerpt.excerpt.split('\n\n').map((paragraph, i) => {
              const highlights = HIGHLIGHTS[excerpt.dimensionKey] ?? []
              return (
                <p key={i} style={{ marginBottom: 'var(--space-4)', margin: '0 0 var(--space-4) 0' }}>
                  {applyHighlights(paragraph, highlights)}
                </p>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
