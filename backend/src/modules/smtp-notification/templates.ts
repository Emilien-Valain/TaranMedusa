type TemplateResult = { subject: string; html: string }

const COLORS = {
  navy: "#0d2b5e",
  blue: "#1565c0",
  cyan: "#0099d6",
  white: "#ffffff",
  bgLight: "#f0f2f5",
  bgCard: "#f5f8fc",
  border: "#dde4ee",
  textDark: "#1a1a2e",
  textMuted: "#4a5568",
  textLight: "#8fa3bf",
}

const logoUrl = (() => {
  const base = process.env.MEDUSA_FILE_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:9000"
  return `${base}/static/logo-transparent.png`
})()

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.bgLight}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.bgLight};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(13, 43, 94, 0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color: ${COLORS.navy}; padding: 28px 32px; text-align: center;">
              <img src="${logoUrl}" alt="Taran Industrie" width="160" height="58" style="display: block; margin: 0 auto; max-width: 160px; height: auto; filter: brightness(0) invert(1);" />
            </td>
          </tr>

          <!-- Cyan accent bar -->
          <tr>
            <td style="background-color: ${COLORS.cyan}; height: 3px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: ${COLORS.white}; padding: 36px 32px; color: ${COLORS.textDark}; font-size: 15px; line-height: 1.7;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: ${COLORS.navy}; padding: 24px 32px; text-align: center;">
              <p style="margin: 0 0 6px; color: ${COLORS.cyan}; font-size: 13px; font-style: italic;">
                Définir les besoins, livrer les solutions !
              </p>
              <p style="margin: 0 0 4px; color: ${COLORS.textLight}; font-size: 12px; line-height: 1.5;">
                35, rue des Pierres Fortes · 85500 LES HERBIERS
              </p>
              <p style="margin: 0 0 12px; color: ${COLORS.textLight}; font-size: 12px; line-height: 1.5;">
                Tél : 02 51 92 49 41 · <a href="mailto:contact@taran-industrie.com" style="color: ${COLORS.textLight}; text-decoration: none;">contact@taran-industrie.com</a>
              </p>
              <p style="margin: 0; color: ${COLORS.blue}; font-size: 11px;">
                &copy; ${new Date().getFullYear()} Taran Industrie. Tous droits réservés.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display: inline-block; margin-top: 20px; padding: 13px 32px; background-color: ${COLORS.cyan}; color: ${COLORS.white}; text-decoration: none; border-radius: 50px; font-size: 14px; font-weight: 600; letter-spacing: 0.02em;">${label}</a>`

const divider = `<hr style="border: none; border-top: 1px solid ${COLORS.border}; margin: 24px 0;" />`

const formatAmount = (amount: number, currency: string) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency?.toUpperCase() || "EUR",
  }).format(amount / 100)
}

export const templates: Record<string, (data: Record<string, any>) => TemplateResult> = {
  "order-confirmation": (data) => ({
    subject: `Confirmation de commande #${data.display_id || data.order_id}`,
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Votre commande a été confirmée</h2>
      <p style="margin: 0 0 8px;">Bonjour ${data.customer_name || ""},</p>
      <p style="margin: 0 0 20px;">Nous avons bien reçu votre commande <strong style="color: ${COLORS.navy};">#${data.display_id || data.order_id}</strong>. Nous vous tiendrons informé de son avancement.</p>

      ${data.items?.length ? `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; font-size: 14px; border-collapse: collapse;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px 12px; background-color: ${COLORS.bgCard}; color: ${COLORS.textMuted}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid ${COLORS.border};">Produit</th>
            <th style="text-align: center; padding: 10px 12px; background-color: ${COLORS.bgCard}; color: ${COLORS.textMuted}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid ${COLORS.border};">Qté</th>
            <th style="text-align: right; padding: 10px 12px; background-color: ${COLORS.bgCard}; color: ${COLORS.textMuted}; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid ${COLORS.border};">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item: any) => `
            <tr>
              <td style="padding: 10px 12px; border-bottom: 1px solid ${COLORS.border}; color: ${COLORS.textDark};">${item.title || item.product_title || item.variant_title || "Produit"}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid ${COLORS.border}; text-align: center; color: ${COLORS.textMuted};">${item.quantity}</td>
              <td style="padding: 10px 12px; border-bottom: 1px solid ${COLORS.border}; text-align: right; color: ${COLORS.textDark};">${formatAmount(item.unit_price, data.currency_code)}</td>
            </tr>
          `).join("")}
          <tr>
            <td colspan="2" style="padding: 12px 12px; font-weight: 700; font-size: 15px; color: ${COLORS.navy}; border-top: 2px solid ${COLORS.navy};">Total</td>
            <td style="padding: 12px 12px; font-weight: 700; font-size: 15px; text-align: right; color: ${COLORS.navy}; border-top: 2px solid ${COLORS.navy};">${formatAmount(data.total, data.currency_code)}</td>
          </tr>
        </tbody>
      </table>
      ` : ""}

      ${data.shipping_address ? `
      ${divider}
      <p style="margin: 0 0 4px; font-weight: 600; color: ${COLORS.navy}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">Adresse de livraison</p>
      <p style="margin: 0; color: ${COLORS.textMuted}; font-size: 14px; line-height: 1.6;">
        ${data.shipping_address.first_name} ${data.shipping_address.last_name}<br />
        ${data.shipping_address.address_1}${data.shipping_address.address_2 ? ", " + data.shipping_address.address_2 : ""}<br />
        ${data.shipping_address.postal_code} ${data.shipping_address.city}<br />
        ${data.shipping_address.country_code?.toUpperCase()}
      </p>
      ` : ""}

      ${divider}
      <p style="margin: 0; color: ${COLORS.textMuted}; font-size: 14px;">Merci pour votre confiance.</p>
    `),
  }),

  "password-reset": (data) => ({
    subject: "Réinitialisation de votre mot de passe",
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Réinitialisation de mot de passe</h2>
      <p style="margin: 0 0 8px;">Bonjour,</p>
      <p style="margin: 0 0 8px;">Vous avez demandé à réinitialiser le mot de passe associé à l'adresse <strong style="color: ${COLORS.navy};">${data.email}</strong>.</p>
      <p style="margin: 0 0 4px;">Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable <strong>15 minutes</strong>.</p>
      ${btn(data.url, "Réinitialiser mon mot de passe")}
      ${divider}
      <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted};">Si vous n'avez pas effectué cette demande, ignorez simplement cet e-mail. Votre mot de passe ne sera pas modifié.</p>
    `),
  }),

  "invite-created": (data) => ({
    subject: "Invitation à rejoindre l'espace administrateur",
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Vous avez été invité</h2>
      <p style="margin: 0 0 8px;">Bonjour,</p>
      <p style="margin: 0 0 8px;">Vous avez été invité à rejoindre l'espace administrateur de <strong style="color: ${COLORS.navy};">Taran Industrie</strong>.</p>
      <p style="margin: 0 0 4px;">Cliquez sur le bouton ci-dessous pour créer votre compte et accéder au tableau de bord.</p>
      ${btn(data.url, "Accepter l'invitation")}
      ${divider}
      <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted};">Si vous ne reconnaissez pas cette invitation, ignorez cet e-mail.</p>
    `),
  }),

  "quote-requested": (data) => ({
    subject: `Nouvelle demande de devis de ${data.customer_name || data.customer_email}`,
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Nouvelle demande de devis reçue</h2>
      <p style="margin: 0 0 8px;">Une nouvelle demande de devis a été soumise par <strong style="color: ${COLORS.navy};">${data.customer_name || data.customer_email}</strong>${data.company_name ? ` (${data.company_name})` : ""}.</p>
      <p style="margin: 0 0 4px;"><strong style="color: ${COLORS.navy};">Référence devis :</strong> <span style="color: ${COLORS.textMuted};">${data.quote_id}</span></p>
      ${btn(data.admin_url, "Consulter le devis")}
    `),
  }),

  "quote-sent": (data) => ({
    subject: "Votre devis est prêt à être consulté",
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Votre devis est disponible</h2>
      <p style="margin: 0 0 8px;">Bonjour ${data.customer_name || ""},</p>
      <p style="margin: 0 0 4px;">Nous avons préparé un devis pour votre demande. Vous pouvez le consulter et l'accepter ou le refuser depuis votre espace client.</p>
      ${btn(data.store_url, "Consulter mon devis")}
      ${divider}
      <p style="margin: 0; font-size: 13px; color: ${COLORS.textMuted};">Référence : ${data.quote_id}</p>
    `),
  }),

  "quote-accepted": (data) => ({
    subject: `Devis accepté par ${data.customer_name || data.customer_email}`,
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Devis accepté</h2>
      <p style="margin: 0 0 8px;">Le client <strong style="color: ${COLORS.navy};">${data.customer_name || data.customer_email}</strong>${data.company_name ? ` (${data.company_name})` : ""} a accepté le devis <strong style="color: ${COLORS.navy};">${data.quote_id}</strong>.</p>
      <p style="margin: 0 0 4px;">La commande est maintenant en attente de traitement.</p>
      ${btn(data.admin_url, "Voir la commande")}
    `),
  }),

  "quote-rejected-by-customer": (data) => ({
    subject: `Devis refusé par ${data.customer_name || data.customer_email}`,
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Devis refusé</h2>
      <p style="margin: 0 0 8px;">Le client <strong style="color: ${COLORS.navy};">${data.customer_name || data.customer_email}</strong>${data.company_name ? ` (${data.company_name})` : ""} a refusé le devis <strong style="color: ${COLORS.navy};">${data.quote_id}</strong>.</p>
      ${btn(data.admin_url, "Consulter le devis")}
    `),
  }),

  "quote-rejected-by-merchant": (data) => ({
    subject: "Votre demande de devis n'a pas pu être honorée",
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Devis refusé</h2>
      <p style="margin: 0 0 8px;">Bonjour ${data.customer_name || ""},</p>
      <p style="margin: 0 0 4px;">Nous sommes au regret de vous informer que votre demande de devis <strong style="color: ${COLORS.navy};">${data.quote_id}</strong> n'a pas pu être honorée.</p>
      <p style="margin: 0;">N'hésitez pas à nous contacter pour toute question.</p>
    `),
  }),

  "shipment-confirmation": (data) => ({
    subject: `Votre commande #${data.display_id || data.order_id} a été expédiée`,
    html: baseLayout(`
      <h2 style="color: ${COLORS.navy}; font-size: 20px; margin: 0 0 16px; font-weight: 700;">Votre commande est en route 🚚</h2>
      <p style="margin: 0 0 8px;">Bonjour ${data.customer_name || ""},</p>
      <p style="margin: 0 0 20px;">Bonne nouvelle : votre commande <strong style="color: ${COLORS.navy};">#${data.display_id || data.order_id}</strong> vient d'être expédiée via Colissimo.</p>

      ${data.tracking_number ? `
      <p style="margin: 0 0 4px; font-weight: 600; color: ${COLORS.navy}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">Numéro de suivi</p>
      <p style="margin: 0 0 16px; color: ${COLORS.textDark}; font-size: 16px; font-weight: 700; letter-spacing: 0.02em;">${data.tracking_number}</p>
      ${data.tracking_url ? btn(data.tracking_url, "Suivre mon colis") : ""}
      ` : `
      <p style="margin: 0 0 16px; color: ${COLORS.textMuted};">Vous recevrez prochainement votre numéro de suivi.</p>
      `}

      ${data.shipping_address ? `
      ${divider}
      <p style="margin: 0 0 4px; font-weight: 600; color: ${COLORS.navy}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.04em;">Adresse de livraison</p>
      <p style="margin: 0; color: ${COLORS.textMuted}; font-size: 14px; line-height: 1.6;">
        ${data.shipping_address.first_name || ""} ${data.shipping_address.last_name || ""}<br />
        ${data.shipping_address.address_1 || ""}${data.shipping_address.address_2 ? ", " + data.shipping_address.address_2 : ""}<br />
        ${data.shipping_address.postal_code || ""} ${data.shipping_address.city || ""}<br />
        ${data.shipping_address.country_code?.toUpperCase() || ""}
      </p>
      ` : ""}

      ${divider}
      <p style="margin: 0; color: ${COLORS.textMuted}; font-size: 14px;">Merci pour votre confiance.</p>
    `),
  }),
}

export function renderTemplate(templateId: string, data: Record<string, any>): TemplateResult {
  const templateFn = templates[templateId]
  if (!templateFn) {
    return {
      subject: `Notification - ${templateId}`,
      html: baseLayout(`<p style="margin: 0;">Notification : ${templateId}</p>`),
    }
  }
  return templateFn(data)
}
