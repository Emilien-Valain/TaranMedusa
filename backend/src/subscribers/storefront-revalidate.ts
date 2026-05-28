import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

const PRODUCT_EVENTS = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "product-variant.created",
  "product-variant.updated",
  "product-variant.deleted",
])

const COLLECTION_EVENTS = new Set([
  "product-collection.created",
  "product-collection.updated",
  "product-collection.deleted",
])

const CATEGORY_EVENTS = new Set([
  "product-category.created",
  "product-category.updated",
  "product-category.deleted",
])

function tagsForEvent(eventName: string): string[] {
  const tags = new Set<string>()
  if (PRODUCT_EVENTS.has(eventName)) {
    // A product change can affect category/collection listings that embed products,
    // so invalidate those tags too.
    tags.add("products")
    tags.add("categories")
    tags.add("collections")
  }
  if (COLLECTION_EVENTS.has(eventName)) {
    tags.add("collections")
    tags.add("products")
  }
  if (CATEGORY_EVENTS.has(eventName)) {
    tags.add("categories")
    tags.add("products")
  }
  return Array.from(tags)
}

export default async function storefrontRevalidateHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  const storefrontUrl = process.env.STORE_URL
  const revalidateSecret = process.env.REVALIDATE_SECRET

  if (!storefrontUrl || !revalidateSecret) {
    logger.warn(
      `[storefront-revalidate] STORE_URL ou REVALIDATE_SECRET manquant, revalidation ignorée (${event.name})`
    )
    return
  }

  const tags = tagsForEvent(event.name)
  if (tags.length === 0) {
    return
  }

  try {
    const response = await fetch(`${storefrontUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": revalidateSecret,
      },
      body: JSON.stringify({ tags }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => "")
      logger.error(
        `[storefront-revalidate] Échec revalidation ${event.name} (${response.status}): ${text}`
      )
      return
    }

    logger.info(
      `[storefront-revalidate] ${event.name} → tags ${tags.join(", ")} revalidés`
    )
  } catch (error: any) {
    logger.error(
      `[storefront-revalidate] Erreur revalidation ${event.name}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
    "product-collection.created",
    "product-collection.updated",
    "product-collection.deleted",
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
  ],
}
