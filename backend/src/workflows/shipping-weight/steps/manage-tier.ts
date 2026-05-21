import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { MedusaError } from "@medusajs/framework/utils";
import { SHIPPING_WEIGHT_MODULE } from "../../../modules/shipping-weight";
import ShippingWeightModuleService from "../../../modules/shipping-weight/service";

export type CreateTierInput = {
  profile_id: string;
  min_weight: number;
  max_weight: number;
  price: number;
};

const assertNoOverlap = async (
  service: ShippingWeightModuleService,
  profileId: string,
  minWeight: number,
  maxWeight: number,
  excludeTierId?: string
) => {
  const existing = await service.listWeightTiers({ profile_id: profileId });
  const overlapping = existing.find((tier: any) => {
    if (excludeTierId && tier.id === excludeTierId) return false;
    const existingMin = Number(tier.min_weight);
    const existingMax = Number(tier.max_weight);
    // Strict overlap: tiers can touch at endpoints ([0,5] and [5,10] are valid)
    return minWeight < existingMax && existingMin < maxWeight;
  });

  if (overlapping) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `La tranche ${minWeight}-${maxWeight} kg chevauche une tranche existante (${overlapping.min_weight}-${overlapping.max_weight} kg).`
    );
  }
};

export const createTierStep = createStep(
  "create-shipping-weight-tier",
  async (input: CreateTierInput, { container }) => {
    if (input.max_weight < input.min_weight) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "max_weight doit être supérieur ou égal à min_weight"
      );
    }

    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);

    await assertNoOverlap(
      service,
      input.profile_id,
      input.min_weight,
      input.max_weight
    );

    const tier = await service.createWeightTiers({
      min_weight: input.min_weight,
      max_weight: input.max_weight,
      price: input.price,
      profile_id: input.profile_id,
    });

    return new StepResponse(tier, tier.id);
  },
  async (id, { container }) => {
    if (!id) return;
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
    await service.deleteWeightTiers(id);
  }
);

export type UpdateTierInput = {
  id: string;
  min_weight?: number;
  max_weight?: number;
  price?: number;
};

export const updateTierStep = createStep(
  "update-shipping-weight-tier",
  async (input: UpdateTierInput, { container }) => {
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);

    const previous = await service.retrieveWeightTier(input.id);

    const newMin =
      input.min_weight !== undefined
        ? input.min_weight
        : Number(previous.min_weight);
    const newMax =
      input.max_weight !== undefined
        ? input.max_weight
        : Number(previous.max_weight);

    if (newMax < newMin) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "max_weight doit être supérieur ou égal à min_weight"
      );
    }

    await assertNoOverlap(
      service,
      (previous as any).profile_id ?? (previous as any).profile?.id,
      newMin,
      newMax,
      previous.id
    );

    const updated = await service.updateWeightTiers({
      id: input.id,
      ...(input.min_weight !== undefined && { min_weight: input.min_weight }),
      ...(input.max_weight !== undefined && { max_weight: input.max_weight }),
      ...(input.price !== undefined && { price: input.price }),
    });

    return new StepResponse(updated, previous);
  },
  async (previous, { container }) => {
    if (!previous) return;
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
    await service.updateWeightTiers({
      id: previous.id,
      min_weight: previous.min_weight,
      max_weight: previous.max_weight,
      price: previous.price,
    });
  }
);

export const deleteTierStep = createStep(
  "delete-shipping-weight-tier",
  async (id: string, { container }) => {
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
    await service.deleteWeightTiers(id);
    return new StepResponse(true);
  }
);
