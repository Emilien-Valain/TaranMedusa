import { PricingProvider } from "@/lib/context/pricing-context"
import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import { listCartFreeShippingPrices } from "@/lib/data/fulfillment"
import { getStandardTaxRate } from "@/lib/data/tax-rate"
import { getBaseURL } from "@/lib/util/env"
import { getPricingMode } from "@/lib/util/pricing-display"
import CartMismatchBanner from "@/modules/layout/components/cart-mismatch-banner"
import CookieConsent from "@/modules/legal/components/cookie-consent"
import PricingModeBanner from "@/modules/layout/components/pricing-mode-banner"
import Footer from "@/modules/layout/templates/footer"
import { NavigationHeader } from "@/modules/layout/templates/nav"
import FreeShippingPriceNudge from "@/modules/shipping/components/free-shipping-price-nudge"
import { StoreFreeShippingPrice } from "@/types/shipping-option/http"
import { ArrowUpRightMini, ExclamationCircleSolid } from "@medusajs/icons"
import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart().catch(() => null)
  let freeShippingPrices: StoreFreeShippingPrice[] = []

  if (cart) {
    freeShippingPrices = await listCartFreeShippingPrices(cart.id)
  }

  const pricingMode = getPricingMode(customer)
  const taxRate = pricingMode === "TTC" ? await getStandardTaxRate("fr") : 0

  return (
    <PricingProvider mode={pricingMode} taxRate={taxRate}>
      <NavigationHeader />
      <PricingModeBanner mode={pricingMode} />
      {/* <div className="flex items-center text-neutral-50 justify-center small:p-4 p-2 text-center bg-neutral-900 small:gap-2 gap-1 text-sm"> */}
      {/*   <div className="flex flex-col small:flex-row small:gap-2 gap-1 items-center"> */}
      {/*     <span className="flex items-center gap-1"> */}
      {/*       <ExclamationCircleSolid className="inline" color="#A1A1AA" /> */}
      {/*       Build your own B2B store with this starter: */}
      {/*     </span> */}
      {/**/}
      {/*     <a */}
      {/*       className="group hover:text-ui-fg-interactive-hover text-ui-fg-interactive self-end small:self-auto" */}
      {/*       href="https://git.new/b2b-starter-repo" */}
      {/*       target="_blank" */}
      {/*     > */}
      {/*       GitHub Repo */}
      {/*       <ArrowUpRightMini className="group-hover:text-ui-fg-interactive-hover inline text-ui-fg-interactive" /> */}
      {/*     </a> */}
      {/*   </div> */}
      {/* </div> */}

      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {props.children}

      <Footer />

      <CookieConsent />

      {cart && freeShippingPrices && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          freeShippingPrices={freeShippingPrices}
        />
      )}
    </PricingProvider>
  )
}
