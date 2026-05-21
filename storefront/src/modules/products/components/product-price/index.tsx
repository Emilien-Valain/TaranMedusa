"use client"

import { clx, Text } from "@medusajs/ui"
import { getProductPrice } from "@/lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import { usePricing } from "@/lib/context/pricing-context"

export default function ProductPrice({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })
  const { formatPrice, mode } = usePricing()

  if (!cheapestPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse" />
  }

  const displayed = formatPrice({
    amount: cheapestPrice.calculated_price_number,
    currency_code: cheapestPrice.currency_code,
  })
  const displayedOriginal = formatPrice({
    amount: cheapestPrice.original_price_number,
    currency_code: cheapestPrice.currency_code,
  })

  return (
    <div className="flex flex-col text-neutral-950">
      <span
        className={clx({
          "text-ui-fg-interactive": cheapestPrice.price_type === "sale",
        })}
      >
        <Text
          className="font-medium text-xl"
          data-testid="product-price"
          data-value={cheapestPrice.calculated_price_number}
          data-display-mode={mode}
        >
          À partir de {displayed.replace(` ${mode}`, "")}
        </Text>
        <Text className="text-neutral-600 text-[0.6rem]">{mode}</Text>
      </span>
      {cheapestPrice.price_type === "sale" && (
        <p
          className="line-through text-neutral-500"
          data-testid="original-product-price"
          data-value={cheapestPrice.original_price_number}
        >
          {displayedOriginal}
        </p>
      )}
    </div>
  )
}
