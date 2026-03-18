import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

// Notifies the customer when a merchant rejects a quote
export default async function quoteRejectedByMerchantHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const query = container.resolve("query")

    const { data: quotes } = await query.graph({
      entity: "quote",
      fields: ["id", "customer_id"],
      filters: { id: data.id },
    })

    const quote = quotes[0] as any
    if (!quote) {
      logger.error(`[quote-rejected-by-merchant] Quote ${data.id} not found`)
      return
    }

    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "first_name", "last_name", "email"],
      filters: { id: quote.customer_id },
    })

    const customer = customers[0] as any
    if (!customer?.email) {
      logger.error(`[quote-rejected-by-merchant] Customer email not found for quote ${data.id}`)
      return
    }

    const notificationService = container.resolve("notification")
    await notificationService.createNotifications({
      to: customer.email,
      channel: "email",
      template: "quote-rejected-by-merchant",
      data: {
        quote_id: quote.id,
        customer_name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim(),
      },
    })

    logger.info(`[quote-rejected-by-merchant] Notification envoyée à ${customer.email}`)
  } catch (error) {
    logger.error(`[quote-rejected-by-merchant] Erreur pour le devis ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "quote.rejected_by_merchant",
}
