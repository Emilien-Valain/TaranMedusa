"use client"

import { usePricing } from "@/lib/context/pricing-context"
import clsx from "clsx"

type Props = {
  amount: number | string
  currency_code: string
  className?: string
  showSuffix?: boolean
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

const DisplayPrice = ({
  amount,
  currency_code,
  className,
  showSuffix = true,
  minimumFractionDigits,
  maximumFractionDigits,
}: Props) => {
  const { formatPrice, mode } = usePricing()
  const formatted = formatPrice({
    amount,
    currency_code,
    minimumFractionDigits,
    maximumFractionDigits,
  })
  if (!showSuffix) {
    return <span className={className}>{formatted.replace(` ${mode}`, "")}</span>
  }
  return <span className={clsx(className)}>{formatted}</span>
}

export default DisplayPrice
