import { retrieveCart } from "@/lib/data/cart"
import { retrieveCustomer } from "@/lib/data/customer"
import AccountButton from "@/modules/account/components/account-button"
import CartButton from "@/modules/cart/components/cart-button"
import FilePlus from "@/modules/common/icons/file-plus"
import { MegaMenuWrapper } from "@/modules/layout/components/mega-menu"
import { RequestQuoteConfirmation } from "@/modules/quotes/components/request-quote-confirmation"
import { RequestQuotePrompt } from "@/modules/quotes/components/request-quote-prompt"
import SkeletonAccountButton from "@/modules/skeletons/components/skeleton-account-button"
import SkeletonCartButton from "@/modules/skeletons/components/skeleton-cart-button"
import SkeletonMegaMenu from "@/modules/skeletons/components/skeleton-mega-menu"
import { Suspense } from "react"
import { NavbarShell } from "./navbar-shell"

export async function NavigationHeader() {
  const customer = await retrieveCustomer().catch(() => null)
  const cart = await retrieveCart()

  const nav = (
    <ul className="flex items-center gap-1">
      <li>
        <Suspense fallback={<SkeletonMegaMenu />}>
          <MegaMenuWrapper />
        </Suspense>
      </li>
    </ul>
  )

  const devisButton =
    customer && cart?.items && cart.items.length > 0 ? (
      <RequestQuoteConfirmation>
        <button className="nav-ghost-btn">
          <FilePlus />
          <span className="hidden small:inline-block">Devis</span>
        </button>
      </RequestQuoteConfirmation>
    ) : (
      <RequestQuotePrompt>
        <button className="nav-ghost-btn nav-ghost-btn--accent">
          <FilePlus />
          <span className="hidden small:inline-block">Devis</span>
        </button>
      </RequestQuotePrompt>
    )

  const actions = (
    <>
      {devisButton}
      <Suspense fallback={<SkeletonAccountButton />}>
        <AccountButton customer={customer} />
      </Suspense>
      <Suspense fallback={<SkeletonCartButton />}>
        <CartButton />
      </Suspense>
    </>
  )

  return <NavbarShell nav={nav} actions={actions} />
}
