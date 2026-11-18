import { ICustomerModuleService, MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const ENTREPRISES_GROUP_NAME = "Entreprises"
export const PARTICULIERS_GROUP_NAME = "Particuliers"

async function getOrCreateGroupId(
  customerModule: ICustomerModuleService,
  name: string
): Promise<string> {
  const [group] = await customerModule.listCustomerGroups({ name })
  if (group) return group.id
  return (await customerModule.createCustomerGroups({ name })).id
}

/**
 * Le groupe "Entreprises" porte les tarifs pro : seul un client dont l'entreprise
 * a un SIRET validé y entre. Tous les autres vont dans "Particuliers".
 * Idempotent : recalcule depuis l'état en base, donc sans souci d'ordre entre
 * les événements (customer.created peut arriver après la validation SIRET).
 */
export async function syncPricingGroups(
  container: MedusaContainer,
  customerIds: string[]
) {
  if (customerIds.length === 0) return

  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const customerModule = container.resolve<ICustomerModuleService>(Modules.CUSTOMER)

  const entreprisesId = await getOrCreateGroupId(customerModule, ENTREPRISES_GROUP_NAME)
  const particuliersId = await getOrCreateGroupId(customerModule, PARTICULIERS_GROUP_NAME)

  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "groups.id", "employee.company.siret_validation_status"],
    filters: { id: customerIds },
  })

  for (const customer of customers as any[]) {
    const isPro =
      customer.employee?.company?.siret_validation_status === "validated"
    const [target, other] = isPro
      ? [entreprisesId, particuliersId]
      : [particuliersId, entreprisesId]
    const groupIds = new Set((customer.groups ?? []).map((g: any) => g?.id))

    if (!groupIds.has(target)) {
      await customerModule.addCustomerToGroup({
        customer_id: customer.id,
        customer_group_id: target,
      })
    }
    if (groupIds.has(other)) {
      await customerModule.removeCustomerFromGroup({
        customer_id: customer.id,
        customer_group_id: other,
      })
    }
  }
}

export async function customerIdsOfCompany(
  container: MedusaContainer,
  companyId: string
): Promise<string[]> {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: companies } = await query.graph({
    entity: "company",
    fields: ["employees.customer.id"],
    filters: { id: companyId },
  })
  return ((companies[0] as any)?.employees ?? [])
    .map((e: any) => e?.customer?.id)
    .filter(Boolean)
}
