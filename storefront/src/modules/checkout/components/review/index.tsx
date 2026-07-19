"use client"

import { useState } from "react"
import { Checkbox, Label, Text } from "@medusajs/ui"

import { checkSpendingLimit } from "@/lib/util/check-spending-limit"
import PaymentButton from "@/modules/checkout/components/payment-button"
import Button from "@/modules/common/components/button"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import { B2BCart, B2BCustomer } from "@/types"
import { ExclamationCircle } from "@medusajs/icons"

const Review = ({
  cart,
  customer,
}: {
  cart: B2BCart
  customer: B2BCustomer | null
}) => {
  const spendLimitExceeded = customer
    ? checkSpendingLimit(cart, customer)
    : false

  // Acceptation explicite des CGV, obligatoire avant paiement (Code de la
  // consommation, art. L221-5). Non pré-cochée conformément à la réglementation.
  const [termsAccepted, setTermsAccepted] = useState(false)

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-start gap-x-2 w-full">
        <Checkbox
          id="accept-terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          className="mt-0.5"
          data-testid="terms-checkbox"
        />
        <Label
          htmlFor="accept-terms"
          className="txt-xsmall text-neutral-600 !font-normal cursor-pointer"
        >
          J'ai lu et j'accepte les{" "}
          <LocalizedClientLink
            href="/cgv"
            className="text-neutral-900 underline hover:text-neutral-600"
            target="_blank"
          >
            conditions générales de vente ↗
          </LocalizedClientLink>{" "}
          et la{" "}
          <LocalizedClientLink
            href="/confidentialite"
            className="text-neutral-900 underline hover:text-neutral-600"
            target="_blank"
          >
            politique de confidentialité ↗
          </LocalizedClientLink>
          .
        </Label>
      </div>
      {spendLimitExceeded ? (
        <>
          <div className="flex items-center gap-x-2 bg-neutral-100 p-3 rounded-md shadow-borders-base">
            <ExclamationCircle className="text-orange-500 w-fit overflow-visible" />
            <p className="text-neutral-950 text-xs">
              Cette commande dépasse votre limite de dépense.
              <br />
              Veuillez contacter votre responsable pour approbation
            </p>
          </div>
          <Button className="w-full h-10 rounded-full shadow-none" disabled>
            Commander et payer
          </Button>
        </>
      ) : !termsAccepted ? (
        <Button
          className="w-full h-10 rounded-full shadow-none"
          disabled
          data-testid="submit-order-button"
        >
          Commander et payer
        </Button>
      ) : (
        <PaymentButton cart={cart} data-testid="submit-order-button" />
      )}
    </div>
  )
}

export default Review
