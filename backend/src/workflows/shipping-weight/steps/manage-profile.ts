import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { SHIPPING_WEIGHT_MODULE } from "../../../modules/shipping-weight";
import ShippingWeightModuleService from "../../../modules/shipping-weight/service";

export type CreateProfileInput = {
  name: string;
  description?: string | null;
  free_shipping_threshold?: number | null;
  currency_code?: string;
  is_active?: boolean;
};

export const createProfileStep = createStep(
  "create-shipping-weight-profile",
  async (input: CreateProfileInput, { container }) => {
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);

    const profile = await service.createShippingProfiles({
      name: input.name,
      description: input.description ?? null,
      free_shipping_threshold: input.free_shipping_threshold ?? null,
      currency_code: input.currency_code ?? "eur",
      is_active: input.is_active ?? true,
    });

    return new StepResponse(profile, profile.id);
  },
  async (id, { container }) => {
    if (!id) return;
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
    await service.deleteShippingProfiles(id);
  }
);

export type UpdateProfileInput = {
  id: string;
  name?: string;
  description?: string | null;
  free_shipping_threshold?: number | null;
  currency_code?: string;
  is_active?: boolean;
};

export const updateProfileStep = createStep(
  "update-shipping-weight-profile",
  async (input: UpdateProfileInput, { container }) => {
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);

    const previous = await service.retrieveShippingProfile(input.id);

    const updated = await service.updateShippingProfiles({
      id: input.id,
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.free_shipping_threshold !== undefined && {
        free_shipping_threshold: input.free_shipping_threshold,
      }),
      ...(input.currency_code !== undefined && {
        currency_code: input.currency_code,
      }),
      ...(input.is_active !== undefined && { is_active: input.is_active }),
    });

    return new StepResponse(updated, previous);
  },
  async (previous, { container }) => {
    if (!previous) return;
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
    await service.updateShippingProfiles({
      id: previous.id,
      name: previous.name,
      description: previous.description,
      free_shipping_threshold: previous.free_shipping_threshold,
      currency_code: previous.currency_code,
      is_active: previous.is_active,
    });
  }
);

export const deleteProfileStep = createStep(
  "delete-shipping-weight-profile",
  async (id: string, { container }) => {
    const service =
      container.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
    await service.deleteShippingProfiles(id);
    return new StepResponse(true);
  }
);
