import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { customerIdsOfCompany, syncPricingGroups } from "../lib/pricing-group"

// Place chaque client dans "Entreprises" (tarifs pro) ou "Particuliers" selon le
// statut SIRET de son entreprise. Voir syncPricingGroups.
export default async function pricingGroupSyncHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    let customerIds: string[]
    if (event.name === "customer.created") {
      customerIds = [event.data.id]
    } else if (event.name === "employee.created") {
      const query = container.resolve(ContainerRegistrationKeys.QUERY)
      const { data } = await query.graph({
        entity: "employee",
        fields: ["customer.id"],
        filters: { id: event.data.id },
      })
      customerIds = [(data[0] as any)?.customer?.id].filter(Boolean)
    } else {
      customerIds = await customerIdsOfCompany(container, event.data.id)
    }

    await syncPricingGroups(container, customerIds)
  } catch (error: any) {
    logger.error(
      `[pricing-group-sync] ${event.name} ${event.data.id}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: [
    "customer.created",
    "employee.created",
    "company.siret_submitted",
    "company.siret_approved",
    "company.siret_rejected",
  ],
}
