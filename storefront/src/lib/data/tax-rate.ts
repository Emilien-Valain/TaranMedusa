"use server"

import { sdk } from "@/lib/config"
import { getCacheOptions } from "./cookies"

type TaxRateResponse = {
  country_code: string
  rate: number
  name: string | null
  found: boolean
}

export const getStandardTaxRate = async (
  countryCode: string = "fr"
): Promise<number> => {
  const next = {
    ...(await getCacheOptions(`tax-rate-${countryCode}`)),
  }

  try {
    const res = await sdk.client.fetch<TaxRateResponse>(`/store/tax-rate`, {
      method: "GET",
      query: { country_code: countryCode },
      next,
      cache: "force-cache",
    })
    return res?.rate ?? 0
  } catch {
    return 0
  }
}
