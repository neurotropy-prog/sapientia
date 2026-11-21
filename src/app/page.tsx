/**
 * page.tsx — Landing del test corto.
 *
 * El mismo despliegue sirve varios dominios. La marca de la cabecera
 * depende del host: test.sapientianatural.com muestra Sapientia, el resto Neurotropy.
 */

import { headers } from 'next/headers'
import ClientShell from '@/components/ClientShell'
import SiteHeader from '@/components/SiteHeader'
import ShortTestController from '@/components/gateway/short/ShortTestController'

export default async function Home() {
  const host = (await headers()).get('host') ?? ''
  const brand = host.includes('sapientianatural') ? 'sapientia' : 'neurotropy'

  return (
    <ClientShell>
      <a href="#main-content" className="skip-link">Ir al test</a>
      <SiteHeader variant="landing" brand={brand} />
      <main id="main-content">
        <ShortTestController />
      </main>
    </ClientShell>
  )
}
