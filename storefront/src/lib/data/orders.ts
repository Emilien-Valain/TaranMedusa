"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"
import medusaError from "@/lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,+items.metadata,*items.variant,*items.product",
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ order }) => order)
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("orders")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields:
          "*items,+items.metadata,*items.variant,*items.product,*customer",
        ...filters,
      },
      headers,
      next,
      cache: "force-cache",
    })
    .then(({ orders }) => orders)
    .catch((err) => medusaError(err))
}

export const getOrderInvoice = async (orderId: string): Promise<{ data: string; filename: string }> => {
  const authHeaders = await getAuthHeaders()

  const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

  const response = await fetch(`${MEDUSA_BACKEND_URL}/store/orders/${orderId}/invoice`, {
    method: "GET",
    headers: {
      ...authHeaders,
      "x-publishable-api-key": PUBLISHABLE_KEY || "",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("Invoice fetch failed:", response.status, errorText)
    throw new Error(`Failed to fetch invoice: ${response.status} - ${errorText}`)
  }

  const contentDisposition = response.headers.get("content-disposition")
  const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
  const filename = filenameMatch ? filenameMatch[1] : `invoice-${orderId}.pdf`

  const buffer = await response.arrayBuffer()
  const base64 = Buffer.from(buffer).toString("base64")

  return { data: base64, filename }
}
