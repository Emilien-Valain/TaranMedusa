import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@medusajs/ui"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const createdAt = new Date(order.created_at)

  return (
    <>
      <Heading level="h3" className="mb-2">
        Détails
      </Heading>

      <div className="text-sm text-ui-fg-subtle overflow-auto">
        <div className="flex justify-between">
          <Text>Numéro de Commande</Text>
          <Text>#{order.display_id}</Text>
        </div>

        <div className="flex justify-between mb-2">
          <Text>Commandé le </Text>
          <Text>
            {" "}
            {createdAt.getDate()}-{createdAt.getMonth()}-
            {createdAt.getFullYear()}
          </Text>
        </div>

        <Text>
          Nous avons envoyé les détails de la commande à{" "}
          <span className="font-semibold">{order.email}</span>.
        </Text>
      </div>
    </>
  )
}

export default OrderDetails
