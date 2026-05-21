import { B2BCustomer } from "@/types/global"
import { convertToLocale } from "./money"

export type PriceDisplayMode = "HT" | "TTC"

export type PricingContext = {
  mode: PriceDisplayMode
  taxRate: number
}

export function getPricingMode(
  customer: B2BCustomer | null | undefined
): PriceDisplayMode {
  const status = customer?.employee?.company?.siret_validation_status
  return status === "validated" ? "HT" : "TTC"
}

export function applyVat(
  amount: number | string,
  ctx: PricingContext
): number {
  const value =
    typeof amount === "string" ? parseFloat(amount) : Number(amount)
  if (isNaN(value)) return 0
  if (ctx.mode === "HT") return value
  return value * (1 + ctx.taxRate / 100)
}

export function formatLocalePriceWithVat(
  params: {
    amount: number | string
    currency_code: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  },
  ctx: PricingContext
): string {
  const value = applyVat(params.amount, ctx)
  const formatted = convertToLocale({
    amount: value,
    currency_code: params.currency_code,
    locale: params.locale,
    minimumFractionDigits: params.minimumFractionDigits,
    maximumFractionDigits: params.maximumFractionDigits,
  })
  return `${formatted} ${ctx.mode}`
}
