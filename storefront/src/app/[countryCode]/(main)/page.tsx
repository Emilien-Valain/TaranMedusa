import { listRegions } from "@/lib/data/regions"
import FeaturedProducts from "@/modules/home/components/featured-products"
import Hero from "@/modules/home/components/hero"
import SkeletonFeaturedProducts from "@/modules/skeletons/templates/skeleton-featured-products"
import { Metadata } from "next"
import { Suspense } from "react"

export const dynamicParams = true

export const metadata: Metadata = {
  title: "Taran Industrie - Solutions professionnelles de nettoyage",
  description:
    "Taran Industrie - Définir les besoins, livrer les solutions ! Lingettes professionnelles et produits de nettoyage industriels.",
}

export async function generateStaticParams() {
  const countryCodes = await listRegions().then(
    (regions) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )
  return countryCodes.map((countryCode) => ({ countryCode }))
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  return (
    <div className="flex flex-col">
      {/* -mt-[92px] pulls the hero under the fixed transparent nav */}
      <div className="-mt-[92px]">
        <Hero />
      </div>
      <div className="py-8">
        <Suspense fallback={<SkeletonFeaturedProducts />}>
          <FeaturedProducts countryCode={countryCode} />
        </Suspense>
      </div>
    </div>
  )
}
