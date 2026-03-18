type TemplateResult = { subject: string; html: string }

const baseLayout = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
    .header { background-color: #1a1a1a; padding: 24px 32px; }
    .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; }
    .body { padding: 32px; color: #333333; font-size: 15px; line-height: 1.6; }
    .body h2 { color: #1a1a1a; font-size: 18px; margin-top: 0; }
    .btn { display: inline-block; margin-top: 20px; padding: 12px 28px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: 600; }
    .table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
    .table th { text-align: left; padding: 8px 12px; background-color: #f4f4f4; color: #666666; font-weight: 600; border-bottom: 2px solid #eeeeee; }
    .table td { padding: 8px 12px; border-bottom: 1px solid #eeeeee; }
    .total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid #1a1a1a; border-bottom: none; }
    .footer { background-color: #f4f4f4; padding: 16px 32px; font-size: 12px; color: #999999; text-align: center; }
    .divider { border: none; border-top: 1px solid #eeeeee; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Taran</h1>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} Taran · Tous droits réservés
    </div>
  </div>
</body>
</html>
`

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
      <h2>Votre commande a été confirmée</h2>
      <p>Bonjour ${data.customer_name || ""},</p>
      <p>Nous avons bien reçu votre commande <strong>#${data.display_id || data.order_id}</strong>. Nous vous tiendrons informé de son avancement.</p>

      ${data.items?.length ? `
      <table class="table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Qté</th>
            <th>Prix</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item: any) => `
            <tr>
              <td>${item.title || item.product_title || item.variant_title || "Produit"}</td>
              <td>${item.quantity}</td>
              <td>${formatAmount(item.unit_price, data.currency_code)}</td>
            </tr>
          `).join("")}
          <tr class="total-row">
            <td colspan="2">Total</td>
            <td>${formatAmount(data.total, data.currency_code)}</td>
          </tr>
        </tbody>
      </table>
      ` : ""}

      ${data.shipping_address ? `
      <hr class="divider" />
      <p><strong>Adresse de livraison :</strong><br />
        ${data.shipping_address.first_name} ${data.shipping_address.last_name}<br />
        ${data.shipping_address.address_1}${data.shipping_address.address_2 ? ", " + data.shipping_address.address_2 : ""}<br />
        ${data.shipping_address.postal_code} ${data.shipping_address.city}<br />
        ${data.shipping_address.country_code?.toUpperCase()}
      </p>
      ` : ""}

      <p>Merci pour votre confiance.</p>
    `),
  }),

  "password-reset": (data) => ({
    subject: "Réinitialisation de votre mot de passe",
    html: baseLayout(`
      <h2>Réinitialisation de mot de passe</h2>
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser le mot de passe associé à l'adresse <strong>${data.email}</strong>.</p>
      <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe. Ce lien est valable <strong>15 minutes</strong>.</p>
      <a href="${data.url}" class="btn">Réinitialiser mon mot de passe</a>
      <hr class="divider" />
      <p style="font-size:13px; color:#888888;">Si vous n'avez pas effectué cette demande, ignorez simplement cet e-mail. Votre mot de passe ne sera pas modifié.</p>
    `),
  }),

  "invite-created": (data) => ({
    subject: "Invitation à rejoindre l'espace administrateur",
    html: baseLayout(`
      <h2>Vous avez été invité</h2>
      <p>Bonjour,</p>
      <p>Vous avez été invité à rejoindre l'espace administrateur de <strong>Taran</strong>.</p>
      <p>Cliquez sur le bouton ci-dessous pour créer votre compte et accéder au tableau de bord.</p>
      <a href="${data.url}" class="btn">Accepter l'invitation</a>
      <hr class="divider" />
      <p style="font-size:13px; color:#888888;">Si vous ne reconnaissez pas cette invitation, ignorez cet e-mail.</p>
    `),
  }),

  "quote-requested": (data) => ({
    subject: `Nouvelle demande de devis de ${data.customer_name || data.customer_email}`,
    html: baseLayout(`
      <h2>Nouvelle demande de devis reçue</h2>
      <p>Une nouvelle demande de devis a été soumise par <strong>${data.customer_name || data.customer_email}</strong>${data.company_name ? ` (${data.company_name})` : ""}.</p>
      <p><strong>Référence devis :</strong> ${data.quote_id}</p>
      <a href="${data.admin_url}" class="btn">Consulter le devis</a>
    `),
  }),

  "quote-sent": (data) => ({
    subject: "Votre devis est prêt à être consulté",
    html: baseLayout(`
      <h2>Votre devis est disponible</h2>
      <p>Bonjour ${data.customer_name || ""},</p>
      <p>Le marchand a préparé un devis pour votre demande. Vous pouvez le consulter et l'accepter ou le refuser depuis votre espace client.</p>
      <a href="${data.store_url}" class="btn">Consulter mon devis</a>
      <hr class="divider" />
      <p style="font-size:13px; color:#888888;">Référence : ${data.quote_id}</p>
    `),
  }),

  "quote-accepted": (data) => ({
    subject: `Devis accepté par ${data.customer_name || data.customer_email}`,
    html: baseLayout(`
      <h2>Devis accepté</h2>
      <p>Le client <strong>${data.customer_name || data.customer_email}</strong>${data.company_name ? ` (${data.company_name})` : ""} a accepté le devis <strong>${data.quote_id}</strong>.</p>
      <p>La commande est maintenant en attente de traitement.</p>
      <a href="${data.admin_url}" class="btn">Voir la commande</a>
    `),
  }),

  "quote-rejected-by-customer": (data) => ({
    subject: `Devis refusé par ${data.customer_name || data.customer_email}`,
    html: baseLayout(`
      <h2>Devis refusé</h2>
      <p>Le client <strong>${data.customer_name || data.customer_email}</strong>${data.company_name ? ` (${data.company_name})` : ""} a refusé le devis <strong>${data.quote_id}</strong>.</p>
      <a href="${data.admin_url}" class="btn">Consulter le devis</a>
    `),
  }),

  "quote-rejected-by-merchant": (data) => ({
    subject: "Votre demande de devis n'a pas pu être honorée",
    html: baseLayout(`
      <h2>Devis refusé</h2>
      <p>Bonjour ${data.customer_name || ""},</p>
      <p>Nous sommes au regret de vous informer que votre demande de devis <strong>${data.quote_id}</strong> n'a pas pu être honorée.</p>
      <p>N'hésitez pas à nous contacter pour toute question.</p>
    `),
  }),
}

export function renderTemplate(templateId: string, data: Record<string, any>): TemplateResult {
  const templateFn = templates[templateId]
  if (!templateFn) {
    return {
      subject: `Notification - ${templateId}`,
      html: baseLayout(`<p>Notification : ${templateId}</p>`),
    }
  }
  return templateFn(data)
}
