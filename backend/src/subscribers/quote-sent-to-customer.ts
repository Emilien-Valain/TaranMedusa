import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

// Notifies the customer when a merchant sends them a quote to review
export default async function quoteSentToCustomerHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const query = container.resolve("query")

    const { data: quotes } = await query.graph({
      entity: "quote",
      fields: ["id", "customer_id", "draft_order_id"],
      filters: { id: data.id },
    })

    const quote = quotes[0]
    if (!quote) {
      logger.error(`[quote-sent] Quote ${data.id} not found`)
      return
    }

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name", "last_name", "email"],
      filters: { id: quote.customer_id },
    })

    const customer = customers[0]
    if (!customer?.email) {
      logger.error(`[quote-sent] Customer not found for quote ${data.id}`)
      return
    }

    const storeUrl = process.env.STORE_URL || "http://localhost:8000"

    const notificationService = container.resolve("notification")
    await notificationService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "quote-sent",
      data: {
        quote_id: quote.id,
        customer_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
        store_url: `${storeUrl}/account/quotes/${quote.id}`,
      },
    })

    logger.info(`[quote-sent] Notification envoyée à ${customer.email}`)
  } catch (error) {
    logger.error(`[quote-sent] Erreur pour le devis ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "quote.sent_to_customer",
}
