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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string; resultado?: string }>
}) {
  const host = (await headers()).get('host') ?? ''
  const params = await searchParams
  // Solo en vistas previas (nunca en producción): ?brand=sapientia fuerza la marca
  // y ?resultado=<bucket> abre directamente la pantalla final, sin enviar nada.
  const isPreview = process.env.VERCEL_ENV !== 'production'
  const brand =
    host.includes('sapientianatural') || (isPreview && params.brand === 'sapientia')
      ? 'sapientia'
      : 'neurotropy'
  const previewBucket = isPreview ? params.resultado : undefined

  return (
    <ClientShell>
      <a href="#main-content" className="skip-link">Ir al test</a>
      <SiteHeader variant="landing" brand={brand} />
      <main id="main-content">
        <ShortTestController brand={brand} previewBucket={previewBucket} />
      </main>
    </ClientShell>
  )
}
