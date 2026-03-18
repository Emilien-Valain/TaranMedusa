import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import Thumbnail from "@/modules/products/components/thumbnail"
import { ArrowUturnLeft } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"

const PreviouslyPurchasedProduct = ({
  variant,
}: {
  variant: HttpTypes.StoreOrderLineItem
}) => {
  const { thumbnail, product_title, product_handle, title } = variant

  return (
    <div className="taran-card flex justify-between items-center">
      <div className="flex gap-3">
        <div
          className="w-14 h-14 overflow-hidden bg-gray-100 shrink-0"
          style={{ borderRadius: "8px" }}
        >
          <Thumbnail thumbnail={thumbnail} size="square" />
        </div>
        <div className="flex flex-col justify-center">
          <Text
            className="text-sm font-semibold"
            style={{ color: "var(--color-navy)" }}
          >
            {product_title}
          </Text>
          <Text className="text-xs text-gray-400">{title}</Text>
        </div>
      </div>

      <LocalizedClientLink href={`/products/${product_handle}`}>
        <button className="btn-cyan flex items-center gap-1.5">
          <ArrowUturnLeft className="inline-block" />
          Racheter
        </button>
      </LocalizedClientLink>
    </div>
  )
}

export default PreviouslyPurchasedProduct
