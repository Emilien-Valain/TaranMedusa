import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const query = container.resolve("query")

    const { data: orders } = await query.graph({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "email",
        "total",
        "currency_code",
        "customer.first_name",
        "customer.last_name",
        "items.*",
        "shipping_address.*",
      ],
      filters: { id: data.id },
    })

    const order = orders[0] as any
    if (!order) {
      logger.error(`[order-placed] Order ${data.id} not found`)
      return
    }

    if (!order.email) {
      logger.warn(`[order-placed] No email on order ${data.id}, skipping`)
      return
    }

    const notificationService = container.resolve("notification")
    await notificationService.createNotifications({
      to: order.email as string,
      channel: "email",
      template: "order-confirmation",
      data: {
        display_id: order.display_id,
        order_id: order.id,
        customer_name: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim(),
        items: order.items,
        total: order.total,
        currency_code: order.currency_code,
        shipping_address: order.shipping_address,
      },
    })

    logger.info(`[order-placed] Confirmation envoyée à ${order.email}`)
  } catch (error) {
    logger.error(`[order-placed] Erreur pour la commande ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
