import { MedusaService } from "@medusajs/framework/utils";
import { ShippingProfile, WeightTier } from "./models";

class ShippingWeightModuleService extends MedusaService({
  ShippingProfile,
  WeightTier,
}) {
  async listProfilesWithTiers(filters: Record<string, unknown> = {}) {
    return await this.listShippingProfiles(filters, {
      relations: ["tiers"],
    });
  }

  async retrieveProfileWithTiers(id: string) {
    const [profile] = await this.listShippingProfiles(
      { id },
      { relations: ["tiers"] }
    );
    return profile;
  }
}

export default ShippingWeightModuleService;
