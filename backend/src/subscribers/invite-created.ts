import { SubscriberArgs, type SubscriberConfig } from "@medusajs/framework"

export default async function inviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve("logger")

  try {
    const query = container.resolve("query")

    const { data: invites } = await query.graph({
      entity: "invite",
      fields: ["id", "email", "token"],
      filters: { id: data.id },
    })

    const invite = invites[0]
    if (!invite) {
      logger.error(`[invite-created] Invitation ${data.id} not found`)
      return
    }

    const adminUrl = process.env.ADMIN_URL || "http://localhost:7001"
    const inviteUrl = `${adminUrl}/invite?token=${encodeURIComponent(invite.token)}`

    const notificationService = container.resolve("notification")
    await notificationService.createNotifications({
      to: invite.email,
      channel: "email",
      template: "invite-created",
      data: {
        email: invite.email,
        url: inviteUrl,
      },
    })

    logger.info(`[invite-created] Invitation envoyée à ${invite.email}`)
  } catch (error) {
    logger.error(`[invite-created] Erreur pour l'invitation ${data.id}: ${error.message}`)
  }
}

export const config: SubscriberConfig = {
  event: "invite.created",
}
