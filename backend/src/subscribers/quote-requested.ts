import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

// Notifies the merchant/admin when a customer submits a new request for quote
export default async function quoteRequestedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string; customer_id: string }>) {
  const logger = container.resolve("logger")

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (!adminEmail) {
    logger.warn("[quote-requested] ADMIN_NOTIFICATION_EMAIL not set, skipping notification")
    return
  }

  try {
    const query = container.resolve("query")

    const { data: quotes } = await query.graph({
      entity: "quote",
      fields: ["id", "customer_id", "draft_order_id"],
      filters: { id: data.id },
    })

    const quote = quotes[0]
    if (!quote) {
      logger.error(`[quote-requested] Quote ${data.id} not found`)
      return
    }

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name", "last_name", "email"],
      filters: { id: data.customer_id },
    })

    const customer = customers[0]
    const adminUrl = process.env.ADMIN_URL || "http://localhost:7001"

    const notificationService = container.resolve("notification")
    await notificationService.createNotifications({
      to: adminEmail,
      channel: "email",
      template: "quote-requested",
      data: {
        quote_id: quote.id,
        customer_name: customer
          ? `${customer.first_name || ""} ${customer.last_name || ""}`.trim()
          : "",
        customer_email: customer?.email || "",
        admin_url: `${adminUrl}/orders/quotes/${quote.id}`,
      },
    })

    logger.info(`[quote-requested] Notification envoyée à ${adminEmail}`)
  } catch (error) {
    logger.error(`[quote-requested] Erreur pour le devis ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "quote.requested",
}
