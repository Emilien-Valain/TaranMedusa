import { convertToLocale } from "@/lib/util/money"
import LocalizedClientLink from "@/modules/common/components/localized-client-link"
import CalendarIcon from "@/modules/common/icons/calendar"
import DocumentIcon from "@/modules/common/icons/document"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useMemo } from "react"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const createdAt = new Date(order.created_at)
  const numberOfLines = useMemo(() => {
    return order.items?.reduce((acc, item) => acc + item.quantity, 0) ?? 0
  }, [order])

  return (
    <div className="taran-card flex small:flex-row flex-col small:justify-between small:items-center gap-y-3 items-start">
      <div className="flex gap-x-4 items-center">
        {/* Product thumbnails */}
        <div className="flex min-w-10">
          {order.items?.slice(0, 3).map((i, index) => {
            const numItems = order.items?.length ?? 0
            const rotation =
              index === 0 && numItems > 1
                ? "-3deg"
                : (index === 1 && numItems === 2) || (index === 2 && numItems > 2)
                ? "3deg"
                : "0deg"
            return (
              <div
                key={i.id}
                className="w-8 h-8 border-2 border-white rounded-lg overflow-hidden ml-[-6px] bg-gray-100"
                style={{ transform: `rotate(${rotation})`, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}
              >
                <Image
                  src={i.thumbnail!}
                  alt={i.title}
                  className="h-full w-full object-cover"
                  style={{ transform: `rotate(${rotation})` }}
                  draggable={false}
                  quality={50}
                  width={32}
                  height={32}
                />
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-x-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <CalendarIcon className="opacity-50" />
            {createdAt.toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })}
          </span>
          <span className="flex items-center gap-1">
            <DocumentIcon className="opacity-50" />
            <span data-testid="order-display-id">#{order.display_id}</span>
          </span>
        </div>
      </div>

      <div className="flex gap-x-4 items-center small:justify-normal justify-between w-full small:w-auto">
        <div className="flex items-center text-sm" style={{ color: "var(--color-navy)" }}>
          <span className="font-semibold" data-testid="order-amount">
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
          <span className="mx-2 text-gray-300">·</span>
          <span className="text-gray-400">{`${numberOfLines} ${numberOfLines > 1 ? "articles" : "article"}`}</span>
        </div>

        <LocalizedClientLink href={`/account/orders/details/${order.id}`}>
          <button className="btn-outline-navy" data-testid="card-details-link">
            Plus d'informations
          </button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderCard
