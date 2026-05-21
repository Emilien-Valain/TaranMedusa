import { model } from "@medusajs/framework/utils";
import { ShippingProfile } from "./shipping-profile";

export const WeightTier = model.define("shipping_weight_tier", {
  id: model
    .id({
      prefix: "swt",
    })
    .primaryKey(),
  min_weight: model.number(),
  max_weight: model.number(),
  price: model.bigNumber(),
  profile: model.belongsTo(() => ShippingProfile, {
    mappedBy: "tiers",
  }),
});
