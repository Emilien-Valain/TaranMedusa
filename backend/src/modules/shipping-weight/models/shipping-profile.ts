import { model } from "@medusajs/framework/utils";
import { WeightTier } from "./weight-tier";

export const ShippingProfile = model.define("shipping_weight_profile", {
  id: model
    .id({
      prefix: "swp",
    })
    .primaryKey(),
  name: model.text(),
  description: model.text().nullable(),
  free_shipping_threshold: model.bigNumber().nullable(),
  currency_code: model.text().default("eur"),
  is_active: model.boolean().default(true),
  // Service Colissimo associé à ce profil (ex. "DOM" sans signature,
  // "DOS" avec signature). Envoyé au Web Service lors de l'édition d'étiquette.
  colissimo_product_code: model.text().nullable(),
  tiers: model.hasMany(() => WeightTier, {
    mappedBy: "profile",
  }),
});
