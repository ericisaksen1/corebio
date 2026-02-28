import { Hero3DWrapper } from "@/components/storefront/hero-3d-wrapper"
import { PageComponents } from "@/components/storefront/page-components"

export default async function HomePage() {
  return (
    <div>
      <Hero3DWrapper />
      <PageComponents pageId={null} />
    </div>
  )
}
