"use client"

import { StatusBadge } from "@medusajs/ui"

const StatusTitles: Record<string, string> = {
  accepted: "Accepté",
  customer_rejected: "Rejeté par le Client",
  merchant_rejected: "Rejeté par le Vendeur",
  pending_merchant: "En Attente du Vendeur",
  pending_customer: "En Attente du Client",
}

const StatusColors: Record<string, "green" | "orange" | "red" | "blue"> = {
  accepted: "green",
  customer_rejected: "red",
  merchant_rejected: "red",
  pending_merchant: "orange",
  pending_customer: "orange",
}

export default function QuoteStatusBadge({ status }: { status: string }) {
  return (
    <StatusBadge color={StatusColors[status]}>
      {StatusTitles[status]}
    </StatusBadge>
  )
}
