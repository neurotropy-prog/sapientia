/**
 * page.tsx — Landing del test corto Neurobienestar.
 *
 * Hereda look del LARS (ClientShell + SiteHeader + CSS vars de globals.css)
 * pero el contenido es minimal: SiteHeader + ShortTestController.
 *
 * El test corto está pensado para reactivar leads que ya hicieron
 * el test largo de neurotransmisores (8.300+ contactos en BBDD).
 */

import ClientShell from '@/components/ClientShell'
import SiteHeader from '@/components/SiteHeader'
import ShortTestController from '@/components/gateway/short/ShortTestController'

export default function Home() {
  return (
    <ClientShell>
      <a href="#main-content" className="skip-link">Ir al test</a>
      <SiteHeader variant="landing" />
      <main id="main-content">
        <ShortTestController />
      </main>
    </ClientShell>
  )
}
