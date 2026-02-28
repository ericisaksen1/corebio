import { Hero3DWrapper } from "@/components/storefront/hero-3d-wrapper"
import { GuaranteeSection } from "@/components/storefront/guarantee-section"
import { PageComponents } from "@/components/storefront/page-components"

export default async function HomePage() {
  return (
    <div>
      <Hero3DWrapper />
      <GuaranteeSection />
      <PageComponents pageId={null} />
    </div>
  )
}
