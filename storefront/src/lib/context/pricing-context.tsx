"use client"

import {
  applyVat,
  formatLocalePriceWithVat,
  PriceDisplayMode,
  PricingContext as PricingCtx,
} from "@/lib/util/pricing-display"
import React, { createContext, useContext, useMemo } from "react"

type PricingProviderValue = PricingCtx & {
  applyVat: (amount: number | string) => number
  formatPrice: (params: {
    amount: number | string
    currency_code: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }) => string
}

const PricingContext = createContext<PricingProviderValue | null>(null)

export const PricingProvider = ({
  mode,
  taxRate,
  children,
}: {
  mode: PriceDisplayMode
  taxRate: number
  children: React.ReactNode
}) => {
  const value = useMemo<PricingProviderValue>(
    () => ({
      mode,
      taxRate,
      applyVat: (amount) => applyVat(amount, { mode, taxRate }),
      formatPrice: (params) =>
        formatLocalePriceWithVat(params, { mode, taxRate }),
    }),
    [mode, taxRate]
  )

  return (
    <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
  )
}

export const usePricing = (): PricingProviderValue => {
  const ctx = useContext(PricingContext)
  if (!ctx) {
    return {
      mode: "TTC",
      taxRate: 0,
      applyVat: (amount) =>
        typeof amount === "string" ? parseFloat(amount) : Number(amount) || 0,
      formatPrice: (params) =>
        formatLocalePriceWithVat(params, { mode: "TTC", taxRate: 0 }),
    }
  }
  return ctx
}
