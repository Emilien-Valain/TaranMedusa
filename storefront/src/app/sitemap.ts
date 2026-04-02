import { MetadataRoute } from "next"

const SITE_URL = "https://taran-industrie.com"
const BACKEND_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

async function fetchFromMedusa<T>(path: string, query: Record<string, string> = {}): Promise<T> {
  const params = new URLSearchParams(query)
  const res = await fetch(`${BACKEND_URL}${path}?${params}`, {
    headers: {
      "x-publishable-api-key": PUBLISHABLE_KEY,
    },
    next: { revalidate: 3600 },
  })
  return res.json()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/fr`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/fr/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ]

  // Fetch products
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { products } = await fetchFromMedusa<{ products: { handle: string; updated_at: string }[] }>(
      "/store/products",
      { fields: "handle,updated_at", limit: "1000" }
    )
    productPages = products.map((product) => ({
      url: `${SITE_URL}/fr/products/${product.handle}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (e) {
    console.error("[sitemap] Failed to fetch products:", e)
  }

  // Fetch collections
  let collectionPages: MetadataRoute.Sitemap = []
  try {
    const { collections } = await fetchFromMedusa<{ collections: { handle: string; updated_at: string }[] }>(
      "/store/collections",
      { fields: "handle,updated_at", limit: "100" }
    )
    collectionPages = collections.map((collection) => ({
      url: `${SITE_URL}/fr/collections/${collection.handle}`,
      lastModified: new Date(collection.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  } catch (e) {
    console.error("[sitemap] Failed to fetch collections:", e)
  }

  // Fetch categories
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const { product_categories } = await fetchFromMedusa<{ product_categories: { handle: string; updated_at: string }[] }>(
      "/store/product-categories",
      { fields: "handle,updated_at", limit: "100" }
    )
    categoryPages = product_categories.map((category) => ({
      url: `${SITE_URL}/fr/categories/${category.handle}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }))
  } catch (e) {
    console.error("[sitemap] Failed to fetch categories:", e)
  }

  return [...staticPages, ...productPages, ...collectionPages, ...categoryPages]
}
