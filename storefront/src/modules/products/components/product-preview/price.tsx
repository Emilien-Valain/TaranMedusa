"use client"

import { usePricing } from "@/lib/context/pricing-context"
import { VariantPrice } from "@/lib/util/get-product-price"
import { Text, clx } from "@medusajs/ui"

export default function PreviewPrice({ price }: { price: VariantPrice }) {
  const { formatPrice, mode } = usePricing()
  if (!price) {
    return null
  }

  const displayed = formatPrice({
    amount: price.calculated_price_number,
    currency_code: price.currency_code,
  }).replace(` ${mode}`, "")

  const displayedOriginal = formatPrice({
    amount: price.original_price_number,
    currency_code: price.currency_code,
  }).replace(` ${mode}`, "")

  return (
    <>
      {price.price_type === "sale" && (
        <Text
          className="line-through text-ui-fg-muted"
          data-testid="original-price"
        >
          {displayedOriginal}
        </Text>
      )}

      <Text
        className={clx("text-neutral-950 font-medium text-lg", {
          "text-ui-fg-interactive": price.price_type === "sale",
        })}
        data-testid="price"
      >
        {displayed}
      </Text>
      <Text className="text-neutral-600 text-[0.6rem]">{mode}</Text>
    </>
  )
}
