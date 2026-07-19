import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

const trackingUrlFor = (code?: string) =>
  code
    ? `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(
        code
      )}`
    : undefined

export default async function shipmentCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  const logger = container.resolve("logger")

  if (data.no_notification) {
    return
  }

  try {
    const query = container.resolve("query")

    // data.id = identifiant du fulfillment expédié.
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: [
        "id",
        "labels.tracking_number",
        "labels.tracking_url",
        "labels.label_url",
        "order.id",
        "order.display_id",
        "order.email",
        "order.customer.first_name",
        "order.customer.last_name",
        "order.shipping_address.*",
      ],
      filters: { id: data.id },
    })

    const fulfillment = fulfillments?.[0] as any
    const order = fulfillment?.order

    if (!order?.email) {
      logger.warn(
        `[shipment-created] Aucun e-mail trouvé pour le fulfillment ${data.id}, notification ignorée`
      )
      return
    }

    const label = (fulfillment.labels || [])[0] || {}
    const trackingNumber: string | undefined = label.tracking_number
    const trackingUrl: string | undefined =
      label.tracking_url || trackingUrlFor(trackingNumber)

    const notificationService = container.resolve("notification")
    await notificationService.createNotifications({
      to: order.email as string,
      channel: "email",
      template: "shipment-confirmation",
      data: {
        display_id: order.display_id,
        order_id: order.id,
        customer_name: `${order.customer?.first_name || ""} ${
          order.customer?.last_name || ""
        }`.trim(),
        tracking_number: trackingNumber,
        tracking_url: trackingUrl,
        shipping_address: order.shipping_address,
      },
    })

    logger.info(
      `[shipment-created] Suivi envoyé à ${order.email} (${
        trackingNumber || "sans numéro"
      })`
    )
  } catch (error) {
    logger.error(
      `[shipment-created] Erreur pour le fulfillment ${data.id}: ${
        (error as Error).message
      }`
    )
  }
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
