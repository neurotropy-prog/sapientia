'use client'

/**
 * Footer — Minimalista: copyright izquierda + links legales derecha en línea horizontal.
 * Background: --color-bg-dark (#264233).
 * Mobile: stack vertical centrado. Copyright arriba, links debajo.
 */


const legalLinks = [
  { label: 'Aviso legal', href: 'https://institutoepigenetico.com/aviso-legal' },
  { label: 'Términos y condiciones', href: 'https://institutoepigenetico.com/terminos-y-condiciones' },
  { label: 'Política de privacidad y cookies', href: 'https://institutoepigenetico.com/politica-de-privacidad' },
  { label: 'Contacto', href: 'https://institutoepigenetico.com/contacto' },
]

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-bg-dark)',
        paddingTop: 'var(--space-4)',
        paddingBottom: 'var(--space-4)',
        paddingLeft: 'var(--container-padding-mobile)',
        paddingRight: 'var(--container-padding-mobile)',
      }}
    >
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
          textAlign: 'center',
        }}
      >
        {/* Links legales — una línea separados por | */}
        <nav
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
          }}
        >
          {legalLinks.map((link, i) => (
            <span key={link.label} style={{ display: 'inline-flex', alignItems: 'center' }}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-host-grotesk)',
                  fontSize: 'var(--text-caption)',
                  lineHeight: 'var(--lh-caption)',
                  color: 'rgba(255, 255, 255, 0.5)',
                  textDecoration: 'none',
                  transition: 'opacity var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {link.label}
              </a>
              {i < legalLinks.length - 1 && (
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.3)',
                    margin: '0 var(--space-2)',
                    fontFamily: 'var(--font-host-grotesk)',
                    fontSize: 'var(--text-caption)',
                  }}
                >
                  |
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* Copyright — debajo */}
        <p
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontSize: 'var(--text-caption)',
            lineHeight: 'var(--lh-caption)',
            color: 'rgba(255, 255, 255, 0.4)',
            margin: 0,
          }}
        >
          2026 © Instituto Epigenético™
        </p>
      </div>
    </footer>
  )
}
