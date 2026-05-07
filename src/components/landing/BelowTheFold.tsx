/**
 * BelowTheFold — Las 4 secciones para quien necesite más antes de responder P1.
 * Fondo uniforme --color-bg-secondary. Sin cortes bruscos entre secciones.
 * Formas orgánicas decorativas (solo tablet+).
 * Orden: ESPEJO → TENSIÓN → PRUEBA → ALIVIO → Footer
 */

import MirrorSection from './MirrorSection'
import TensionSection from './TensionSection'
import SocialProofSection from './SocialProofSection'
import FoundersSection from './FoundersSection'
import ReliefSection from './ReliefSection'
import Footer from './Footer'

export default function BelowTheFold() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ background: 'var(--color-bg-primary)' }}>
        <MirrorSection />
        <TensionSection />

        <SocialProofSection />
        <ReliefSection />
        <FoundersSection />
      </div>

      <Footer />
    </div>
  )
}
