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
  tiers: model.hasMany(() => WeightTier, {
    mappedBy: "profile",
  }),
});
