'use client'

/**
 * SiteHeader — Header sticky con logo centrado para todas las páginas.
 *
 * Variantes:
 *   - default: opaco siempre (mapa, pago, showcase)
 *   - landing: transparente → opaco al scroll (>100px) o gateway activo
 *   - admin: opaco con posible link admin
 */

import { useState, useEffect } from 'react'

/** Tienda Shopify de Sapientia: destino del logo y del enlace de vuelta en test.sapientianatural.com. */
const SAPIENTIA_STORE_URL = 'https://sapientianatural.com'

interface SiteHeaderProps {
  variant?: 'default' | 'landing' | 'admin'
  /** Marca a mostrar. 'sapientia' se usa en test.sapientianatural.com. */
  brand?: 'neurotropy' | 'sapientia'
}

export default function SiteHeader({ variant = 'default', brand = 'neurotropy' }: SiteHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [gatewayActive, setGatewayActive] = useState(false)

  useEffect(() => {
    if (variant !== 'landing') return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    // Check for gateway overlay in DOM (GatewayBloque components use .gateway-overlay)
    const observer = new MutationObserver(() => {
      const overlay = document.querySelector('.gateway-overlay')
      setGatewayActive(!!overlay)
    })

    observer.observe(document.body, { childList: true, subtree: true })
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [variant])

  // Landing: transparent → opaque on scroll/gateway. Default/admin: always semi-transparent (blur).
  const isOpaque = variant === 'landing' && (isScrolled || gatewayActive)

  return (
    <header
      className={`site-header ${isOpaque ? 'site-header--opaque' : ''}`}
      data-variant={variant}
    >
      <div className="site-header__container">
        {brand === 'sapientia' ? (
          <a href={SAPIENTIA_STORE_URL} className="site-header__logo-link" aria-label="Sapientia — Volver a la tienda">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-sapientia.svg"
              alt="Sapientia"
              className="site-header__logo"
              style={{ height: '30px' }}
              width={130}
              height={30}
              loading="eager"
            />
          </a>
        ) : (
          <a href="/" className="site-header__logo-link" aria-label="Neurotropy — Ir al inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo-definitivo-IE.png"
              alt=""
              className="site-header__logo"
              width={156}
              height={28}
              loading="eager"
            />
          </a>
        )}
        {brand === 'sapientia' && (
          <a href={SAPIENTIA_STORE_URL + '/collections/all'} className="site-header__store-link">
            ← Volver a la tienda
          </a>
        )}
      </div>
    </header>
  )
}
