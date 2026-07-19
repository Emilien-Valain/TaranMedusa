"use server"

import { sdk } from "@/lib/config"
import { getCacheOptions } from "./cookies"

type TaxRateResponse = {
  country_code: string
  rate: number
  name: string | null
  found: boolean
}

/**
 * Taux de TVA de repli (en %) utilisé quand le taux réel ne peut pas être
 * récupéré ou est invalide. On ne doit JAMAIS retomber sur 0 : un particulier
 * (mode TTC) verrait alors des prix HT étiquetés « TTC » puis +TVA au paiement,
 * ce qui est illégal en B2C. 20 % = taux standard français (cf. CONTEXT.md).
 * Surchargeable via NEXT_PUBLIC_DEFAULT_TVA_RATE.
 */
const DEFAULT_TVA_RATE = Number(process.env.NEXT_PUBLIC_DEFAULT_TVA_RATE) || 20

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

    // On n'accepte qu'un taux strictement positif. Un 0 / absence de taux
    // (found: false) ne doit pas être pris pour un vrai taux : repli sûr.
    const rate = Number(res?.rate)
    if (res?.found && Number.isFinite(rate) && rate > 0) {
      return rate
    }
    return DEFAULT_TVA_RATE
  } catch {
    return DEFAULT_TVA_RATE
  }
}
