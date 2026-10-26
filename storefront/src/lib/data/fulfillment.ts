"use server"

import { sdk } from "@/lib/config"
import { getAuthHeaders, getCacheOptions } from "@/lib/data/cookies"
import { StoreFreeShippingPrice } from "@/types/shipping-option/http"
import { HttpTypes } from "@medusajs/types"

export const listCartShippingMethods = async (cartId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("fulfillment")),
  }

  return sdk.client
    .fetch<HttpTypes.StoreShippingOptionListResponse>(
      `/store/shipping-options`,
      {
        method: "GET",
        query: { cart_id: cartId },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(async ({ shipping_options }) => {
      // Les options "calculated" (livraison au poids) n'ont pas de prix dans la
      // liste : on le calcule à part, sans cache car il dépend du panier.
      const priced = await Promise.all(
        shipping_options.map(async (option) => {
          if (option.price_type !== "calculated") return option
          return sdk.client
            .fetch<{ shipping_option: HttpTypes.StoreCartShippingOption }>(
              `/store/shipping-options/${option.id}/calculate`,
              {
                method: "POST",
                body: { cart_id: cartId },
                headers,
                cache: "no-store",
              }
            )
            .then(({ shipping_option }) => shipping_option)
            // Poids hors tranches : l'option n'est pas sélectionnable.
            .catch(() => null)
        })
      )
      return priced.filter(
        (option): option is HttpTypes.StoreCartShippingOption => !!option
      )
    })
    .catch(() => {
      return null
    })
}

export const listCartFreeShippingPrices = async (
  cartId: string
): Promise<StoreFreeShippingPrice[]> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("freeShipping")),
  }

  return sdk.client
    .fetch<{
      prices: StoreFreeShippingPrice[]
    }>(`/store/free-shipping/prices`, {
      method: "GET",
      query: { cart_id: cartId },
      headers,
      next,
      cache: "force-cache",
    })
    .then((data) => data.prices)
}
