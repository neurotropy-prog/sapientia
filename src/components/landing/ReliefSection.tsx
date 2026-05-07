'use client'

/**
 * ReliefSection — Sección ALIVIO.
 * Overline + headline Lora + card de credenciales + counter colectivo + CTA lima.
 * Footer extraído a componente separado.
 */

import { useRef, useEffect, useState } from 'react'
import { useCopy } from '@/lib/copy'
import Counter from '@/components/ui/Counter'

export default function ReliefSection() {
  const { getCopy } = useCopy()
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    const el = sectionRef.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleCTA = () => {
    const p1 = document.getElementById('p1-section')
    if (p1) {
      p1.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('scrollToP1'))
      }, 600)
    }
  }

  const stagger = (delayMs: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 600ms var(--ease-out-expo) ${delayMs}ms, transform 600ms var(--ease-out-expo) ${delayMs}ms`,
  })

  return (
    <section
      ref={sectionRef}
      aria-label="Qué mide el análisis"
      style={{
        paddingTop: 'var(--space-8)',
        paddingBottom: 'var(--space-20)',
        paddingLeft: 'var(--container-padding-mobile)',
        paddingRight: 'var(--container-padding-mobile)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Overline */}
        <p className="overline-accent" style={stagger(0)}>
          {getCopy('relief.overline')}
        </p>

        {/* Headline — Lora Regular, --text-h2 */}
        <h2
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-h2)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            fontWeight: 400,
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-5)',
            ...stagger(100),
          }}
        >
          {(() => {
            const text = getCopy('relief.headline')
            const target = 'Hasta ahora.'
            const idx = text.indexOf(target)
            if (idx === -1) return text
            return <>{text.slice(0, idx)}<strong>{target}</strong>{text.slice(idx + target.length)}</>
          })()}
        </h2>

        {/* Descripción */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body)',
            lineHeight: 'var(--lh-body)',
            color: 'var(--color-text-secondary)',
            maxWidth: 'var(--text-max-width)',
            marginBottom: 'var(--space-8)',
            ...stagger(200),
          }}
        >
          {(() => {
            const desc = getCopy('relief.description')
            const boldPhrase = 'recibirás el mapa único de tu sistema nervioso'
            const idx = desc.indexOf(boldPhrase)
            if (idx === -1) return desc
            return (
              <>
                {desc.slice(0, idx)}
                <strong><mark style={{ background: 'url(https://s2.svgbox.net/pen-brushes.svg?ic=brush-1&color=edd274)', margin: '-2px -6px', padding: '2px 6px', color: 'inherit' }}>{boldPhrase}</mark></strong>
                {desc.slice(idx + boldPhrase.length)}
              </>
            )
          })()}
        </p>

        {/* Barra de stats */}
        <style>{`
          .relief-stats-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: var(--space-4);
          }
          @media (min-width: 640px) {
            .relief-stats-grid {
              grid-template-columns: repeat(4, 1fr);
            }
          }
        `}</style>
        <div
          className="relief-stats-grid"
          style={{
            background: 'var(--color-bg-secondary)',
            borderRadius: '20px',
            padding: 'var(--space-6) var(--space-6)',
            width: '100%',
            maxWidth: '820px',
            marginBottom: 'var(--space-6)',
            textAlign: 'center',
            ...stagger(300),
          }}
        >
          {/* 25.000+ */}
          <div>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1.2, margin: 0, marginBottom: 'var(--space-2)' }}>
              {visible ? '25.000+' : '0'}
            </p>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-caption)', fontWeight: 600, lineHeight: 1.3, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Sistemas nerviosos analizados
            </p>
          </div>

          {/* 5.000+ */}
          <div>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1.2, margin: 0, marginBottom: 'var(--space-2)' }}>
              {visible ? '5.000+' : '0'}
            </p>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-caption)', fontWeight: 600, lineHeight: 1.3, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Consultas de medicina funcional
            </p>
          </div>

          {/* +20 años */}
          <div>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1.2, margin: 0, marginBottom: 'var(--space-2)' }}>
              {visible ? <Counter from={0} to={20} duration={800} prefix="+" /> : '+0'}
              {' años'}
            </p>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-caption)', fontWeight: 600, lineHeight: 1.3, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              De práctica e investigación
            </p>
          </div>

          {/* 7 libros */}
          <div>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-h3)', fontWeight: 700, color: 'var(--color-accent)', lineHeight: 1.2, margin: 0, marginBottom: 'var(--space-2)' }}>
              {visible ? <Counter from={0} to={7} duration={600} /> : '0'}
              {' libros'}
            </p>
            <p style={{ fontFamily: 'var(--font-host-grotesk)', fontSize: 'var(--text-caption)', fontWeight: 600, lineHeight: 1.3, color: 'var(--color-text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Publicados sobre regulación epigenética
            </p>
          </div>
        </div>

        {/* Dato colectivo — counter animado */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--lh-body-sm)',
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-12)',
            ...stagger(400),
          }}
        >
          {visible ? <Counter to={142} duration={800} /> : '0'}
          {' '}{getCopy('relief.collective').replace('{{count}}', '')}
        </p>

        {/* CTA LIMA */}
        <button
          onClick={handleCTA}
          aria-label="Volver al inicio para empezar el análisis"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body)',
            lineHeight: 1,
            fontWeight: 500,
            color: 'var(--color-cta-text)',
            background: 'var(--color-cta)',
            border: 'none',
            borderRadius: 'var(--radius-pill)',
            padding: '16px 36px',
            cursor: 'pointer',
            transition: `opacity 600ms var(--ease-out-expo) 500ms, transform 600ms var(--ease-out-expo) 500ms, box-shadow var(--transition-base), background var(--transition-base)`,
            marginBottom: 'var(--space-4)',
            minHeight: '52px',
            opacity: visible ? 1 : 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-cta-hover)'
            e.currentTarget.style.transform = 'scale(1.02)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 245, 100, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-cta)'
            e.currentTarget.style.transform = 'none'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {getCopy('relief.cta')}
        </button>

        {/* Disuelve fricción */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-body-sm)',
            lineHeight: 'var(--lh-body-sm)',
            color: 'var(--color-text-tertiary)',
            ...stagger(600),
          }}
        >
          {getCopy('relief.friction')}
        </p>
      </div>
    </section>
  )
}
