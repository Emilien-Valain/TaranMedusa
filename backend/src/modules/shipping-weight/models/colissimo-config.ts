import { model } from "@medusajs/framework/utils";

/**
 * Réglages Colissimo (singleton), éditables depuis l'admin.
 * Les identifiants en base prennent le pas sur les variables d'environnement.
 */
export const ColissimoConfig = model.define("colissimo_config", {
  id: model
    .id({
      prefix: "colconf",
    })
    .primaryKey(),
  // Si false : aucune étiquette générée automatiquement (expédition 100% manuelle).
  enabled: model.boolean().default(true),
  // Authentification : apiKey (recommandé) ou contrat + mot de passe (déprécié).
  api_key: model.text().nullable(),
  contract_number: model.text().nullable(),
  password: model.text().nullable(),
  // Format d'étiquette (ex. PDF_A4_300dpi, PDF_10x15_300dpi, ZPL_10x15_300dpi).
  label_format: model.text().nullable(),
  // Adresse expéditeur de repli (si le stock location n'a pas d'adresse complète).
  sender_name: model.text().nullable(),
  sender_street: model.text().nullable(),
  sender_street2: model.text().nullable(),
  sender_zip: model.text().nullable(),
  sender_city: model.text().nullable(),
  sender_country: model.text().nullable(),
  sender_phone: model.text().nullable(),
  sender_email: model.text().nullable(),
});
