import { Metadata } from "next"

import { retrieveCustomer } from "@/lib/data/customer"
import { listOrders } from "@/lib/data/orders"
import Overview from "@/modules/account/components/overview"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Compte",
  description: "Aperçu de l'activité de votre compte",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer().catch(() => null)
  const orders = await listOrders().catch(() => null)

  if (!customer) {
    notFound()
  }

  return <Overview customer={customer} orders={orders} />
}
