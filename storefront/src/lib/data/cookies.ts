"use server"

import "server-only"

import { cookies as nextCookies } from "next/headers"

export const getAuthHeaders = async (): Promise<
  { authorization: string } | {}
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_jwt")?.value

    if (token) {
      return { authorization: `Bearer ${token}` }
    }

    return {}
  } catch (error) {
    return {}
  }
}

export const getCacheTag = async (tag: string): Promise<string> => {
  try {
    const cookies = await nextCookies()
    const cacheId = cookies.get("_medusa_cache_id")?.value

    if (!cacheId) {
      return ""
    }

    return `${tag}-${cacheId}`
  } catch (error) {
    return ""
  }
}

// Catalog data is cached with cache: "force-cache" and no expiry, so a failed
// backend webhook keeps a stale list forever. This time limit is the safety net:
// the webhook stays the fast path, the timer is the fallback.
const CATALOG_REVALIDATE_SECONDS = 60

const TIME_LIMITED_TAGS = new Set([
  "products",
  "categories",
  "collections",
  "regions",
])

export const getCacheOptions = async (
  tag: string
): Promise<{ tags: string[]; revalidate?: number } | {}> => {
  if (typeof window !== "undefined") {
    return {}
  }

  const cacheTag = await getCacheTag(tag)

  const timeLimit = TIME_LIMITED_TAGS.has(tag)
    ? { revalidate: CATALOG_REVALIDATE_SECONDS }
    : {}

  // Always include the global tag so backend webhooks can invalidate every user's
  // cache at once with a single revalidateTag(tag) call.
  if (!cacheTag) {
    return { tags: [tag], ...timeLimit }
  }

  return { tags: [cacheTag, tag], ...timeLimit }
}

export const setAuthToken = async (token: string) => {
  const cookies = await nextCookies()

  cookies.set("_medusa_jwt", token, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeAuthToken = async () => {
  const cookies = await nextCookies()

  cookies.delete("_medusa_jwt")
}

export const getCartId = async () => {
  try {
    const cookies = await nextCookies()
    return cookies.get("_medusa_cart_id")?.value
  } catch (error) {
    return undefined
  }
}

export const setCartId = async (cartId: string) => {
  const cookies = await nextCookies()

  cookies.set("_medusa_cart_id", cartId, {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  })
}

export const removeCartId = async () => {
  const cookies = await nextCookies()

  cookies.set("_medusa_cart_id", "", {
    maxAge: -1,
  })
}
