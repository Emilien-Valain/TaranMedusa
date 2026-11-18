import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { syncPricingGroups } from "../lib/pricing-group"

// Rattrapage unique : retire des "Entreprises" les clients dont le SIRET n'est pas validé.
// npx medusa exec ./src/scripts/sync-pricing-groups.ts
export default async function syncAllPricingGroups({ container }: ExecArgs) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "customer", fields: ["id"] })
  await syncPricingGroups(container, data.map((c: any) => c.id))
  container.resolve("logger").info(`[sync-pricing-groups] ${data.length} clients synchronisés`)
}
