import { ICustomerModuleService } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"
import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

const PARTICULIERS_GROUP_NAME = "Particuliers"
const ENTREPRISES_GROUP_NAME = "Entreprises"

async function getOrCreateCustomerGroup(
  customerModuleService: ICustomerModuleService,
  name: string
): Promise<string> {
  const [groups] = await customerModuleService.listAndCountCustomerGroups({ name })

  if (groups.length > 0) {
    return groups[0].id
  }

  const group = await customerModuleService.createCustomerGroups({ name })
  return group.id
}

export default async function customerCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const customerModuleService = container.resolve<ICustomerModuleService>(
      Modules.CUSTOMER
    )

    const customer = await customerModuleService.retrieveCustomer(data.id)

    const groupName = customer.company_name
      ? ENTREPRISES_GROUP_NAME
      : PARTICULIERS_GROUP_NAME

    const groupId = await getOrCreateCustomerGroup(customerModuleService, groupName)

    await customerModuleService.addCustomerToGroup({
      customer_id: data.id,
      customer_group_id: groupId,
    })

    logger.info(
      `[customer-created] Client ${data.id} assigné au groupe "${groupName}"`
    )
  } catch (error) {
    logger.error(
      `[customer-created] Erreur lors de l'assignation du groupe pour le client ${data.id}: ${error.message}`
    )
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
