import { SubscriberArgs, type SubscriberConfig } from '@medusajs/framework';

export default async function passwordResetHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  entity_id: string;
  actor_type: string;
  token: string;
  email: string;
}>) {
  const logger = container.resolve('logger');

  try {
    const storeUrl = process.env.STORE_URL || 'http://localhost:8000';
    const countryCode = process.env.STORE_DEFAULT_COUNTRY || 'fr';
    const resetUrl = `${storeUrl}/${countryCode}/account?token=${encodeURIComponent(data.token)}`;

    const notificationService = container.resolve('notification');
    await notificationService.createNotifications({
      to: data.email,
      channel: 'email',
      template: 'password-reset',
      data: {
        email: data.email,
        url: resetUrl,
      },
    });

    logger.info(
      `[password-reset] Lien de réinitialisation envoyé à ${data.email}`,
    );
  } catch (error) {
    logger.error(`[password-reset] Erreur: ${error.message}`);
  }
}

export const config: SubscriberConfig = {
  event: 'auth.password_reset',
};
