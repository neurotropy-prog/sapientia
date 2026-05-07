'use client'

/**
 * FoundersSection — Módulo de fundadores en la landing.
 * Dos tarjetas lado a lado (desktop) o apiladas (mobile).
 * Foto circular grande + nombre + título + bio descriptiva.
 */

import { useRef, useEffect, useState } from 'react'

interface FounderData {
  photo: string
  alt: string
  name: string
  title: string
  bio: string
}

const founders: FounderData[] = [
  {
    photo: '/carlos-460x655.jpg',
    alt: 'Dr. Carlos Alvear L.',
    name: 'Dr. Carlos Alvear L.',
    title: 'Medical & Psychotherapy Manager',
    bio: 'Médico cirujano con formación en Mind–Body Medicine en Harvard. Certificado en respiración holotrópica por el Dr. Stanislav Grof y en terapia regresiva junguiana. Más de 20 años de experiencia médica y miles de pacientes tratados con medicina funcional y de precisión. Fundador del Centro de Rehabilitación con plantas maestras Yolitia y creador del programa Inscape Recover© y del sistema de regulación de neurotransmisores Sapientia©',
  },
  {
    photo: '/javier.png',
    alt: 'Javier A. Martín Ramos',
    name: 'Javier A. Martín Ramos',
    title: 'Director / Mindset Advisor',
    bio: 'Autor, divulgador y emprendedor en nuevas tecnologías aplicadas al bienestar emocional y el crecimiento personal. Licenciado en Comunicación y Máster en Nuevas Tecnologías. Formado en genética, epigenética y terapia transpersonal. Colabora con médicos funcionales, psicólogos y neurocientíficos en el diseño de programas de transformación. Experiencia con clientes como Real Madrid, Walt Disney, BBVA, Redbull, Vodafone...',
  },
]

export default function FoundersSection() {
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

  const stagger = (delayMs: number) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity 600ms var(--ease-out-expo) ${delayMs}ms, transform 600ms var(--ease-out-expo) ${delayMs}ms`,
  })

  return (
    <section
      ref={sectionRef}
      aria-label="Fundadores"
      style={{
        paddingTop: 'var(--space-12)',
        paddingBottom: '120px',
        paddingLeft: 'var(--container-padding-mobile)',
        paddingRight: 'var(--container-padding-mobile)',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Headline */}
        <h2
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-h2)',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            textAlign: 'center',
            marginBottom: 'var(--space-10)',
            ...stagger(0),
          }}
        >
          Los fundadores del Instituto Epigenético™
        </h2>

        {/* Founder cards — side by side on desktop, stacked on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-8)',
            width: '100%',
          }}
        >
          {founders.map((founder, i) => (
            <div
              key={founder.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                ...stagger(150 + i * 200),
              }}
            >
              {/* Photo */}
              <img
                src={founder.photo}
                alt={founder.alt}
                width={180}
                height={180}
                style={{
                  width: '180px',
                  height: '180px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center 15%',
                  flexShrink: 0,
                  border: '4px solid rgba(30, 19, 16, 0.06)',
                  marginBottom: 'var(--space-5)',
                }}
              />

              {/* Name */}
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body)',
                  fontWeight: 700,
                  color: 'var(--color-text-primary)',
                  margin: 0,
                  marginBottom: 'var(--space-1)',
                }}
              >
                {founder.name}
              </p>

              {/* Title */}
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 500,
                  color: 'var(--color-accent)',
                  margin: 0,
                  marginBottom: 'var(--space-4)',
                }}
              >
                {founder.title}
              </p>

              {/* Bio */}
              <p
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-body-sm)',
                  lineHeight: 'var(--lh-body)',
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                {founder.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
