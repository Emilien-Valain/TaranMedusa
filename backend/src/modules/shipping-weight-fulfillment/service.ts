import {
  AbstractFulfillmentProviderService,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  CalculatedShippingOptionPrice,
  CalculateShippingOptionPriceDTO,
  CreateFulfillmentResult,
  CreateShippingOptionDTO,
  FulfillmentDTO,
  FulfillmentItemDTO,
  FulfillmentOption,
  FulfillmentOrderDTO,
  Logger,
} from "@medusajs/framework/types";
import { SHIPPING_WEIGHT_MODULE } from "../shipping-weight";
import ShippingWeightModuleService from "../shipping-weight/service";

type InjectedDependencies = {
  logger: Logger;
  [SHIPPING_WEIGHT_MODULE]?: ShippingWeightModuleService;
};

class ShippingWeightFulfillmentService extends AbstractFulfillmentProviderService {
  static identifier = "shipping-weight";

  protected logger_: Logger;
  protected container_: InjectedDependencies;

  constructor(container: InjectedDependencies) {
    super();
    this.container_ = container;
    this.logger_ = container.logger;
  }

  protected resolveShippingWeightService(): ShippingWeightModuleService {
    const svc =
      this.container_[SHIPPING_WEIGHT_MODULE] ??
      (this.container_ as any)[SHIPPING_WEIGHT_MODULE];

    if (!svc) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Cannot resolve ${SHIPPING_WEIGHT_MODULE} module from fulfillment provider container.`
      );
    }

    return svc;
  }

  async getFulfillmentOptions(): Promise<FulfillmentOption[]> {
    try {
      const shippingWeightService = this.resolveShippingWeightService();
      const profiles = await shippingWeightService.listShippingProfiles({
        is_active: true,
      });

      return profiles.map((profile) => ({
        id: profile.id,
        name: profile.name,
      }));
    } catch (error) {
      this.logger_?.error(
        `Failed to load shipping-weight profiles: ${(error as Error).message}`
      );
      return [];
    }
  }

  async validateFulfillmentData(
    optionData: Record<string, unknown>,
    data: Record<string, unknown>
  ): Promise<any> {
    return data;
  }

  async validateOption(data: Record<string, any>): Promise<boolean> {
    if (!data?.id || typeof data.id !== "string") {
      return false;
    }

    try {
      const shippingWeightService = this.resolveShippingWeightService();
      const profile = await shippingWeightService.retrieveProfileWithTiers(
        data.id as string
      );
      return !!profile;
    } catch {
      return false;
    }
  }

  async canCalculate(_data: CreateShippingOptionDTO): Promise<boolean> {
    return true;
  }

  async calculatePrice(
    optionData: CalculateShippingOptionPriceDTO["optionData"],
    _data: CalculateShippingOptionPriceDTO["data"],
    context: CalculateShippingOptionPriceDTO["context"]
  ): Promise<CalculatedShippingOptionPrice> {
    const profileId = (optionData as { id?: string })?.id;

    if (!profileId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Profil de poids manquant pour le calcul du prix de livraison."
      );
    }

    const shippingWeightService = this.resolveShippingWeightService();
    const profile = await shippingWeightService.retrieveProfileWithTiers(
      profileId
    );

    if (!profile) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Profil de livraison ${profileId} introuvable.`
      );
    }

    const cart = context as unknown as {
      items?: Array<{
        quantity?: number;
        variant?: { weight?: number | null } | null;
        product?: { weight?: number | null } | null;
      }>;
      item_total?: number | string | null;
      subtotal?: number | string | null;
    };

    const items = cart?.items ?? [];
    let totalWeightGrams = 0;
    for (const item of items) {
      const variantWeight =
        item?.variant?.weight ?? item?.product?.weight ?? 0;
      totalWeightGrams +=
        Number(variantWeight ?? 0) * Number(item?.quantity ?? 0);
    }

    const totalWeightKg = totalWeightGrams / 1000;

    const cartSubtotalRaw =
      cart?.item_total ?? cart?.subtotal ?? 0;
    const cartSubtotal = Number(cartSubtotalRaw ?? 0);

    const freeThreshold = profile.free_shipping_threshold
      ? Number(profile.free_shipping_threshold)
      : null;

    if (freeThreshold !== null && freeThreshold > 0 && cartSubtotal >= freeThreshold) {
      return {
        calculated_amount: 0,
        is_calculated_price_tax_inclusive: false,
      };
    }

    const tiers = (profile.tiers ?? []).slice().sort((a: any, b: any) => {
      return Number(a.min_weight) - Number(b.min_weight);
    });

    if (tiers.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Aucune tranche de poids configurée pour le profil "${profile.name}".`
      );
    }

    const matchedTier = tiers.find((tier: any) => {
      const minW = Number(tier.min_weight);
      const maxW = Number(tier.max_weight);
      return totalWeightKg >= minW && totalWeightKg <= maxW;
    });

    if (!matchedTier) {
      const maxConfiguredWeight = Math.max(
        ...tiers.map((t: any) => Number(t.max_weight))
      );
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Le poids du panier (${totalWeightKg.toFixed(
          2
        )} kg) dépasse la limite maximale configurée (${maxConfiguredWeight} kg) pour "${profile.name}". Merci de nous contacter pour un devis.`
      );
    }

    return {
      calculated_amount: Number(matchedTier.price),
      is_calculated_price_tax_inclusive: false,
    };
  }

  async createFulfillment(
    data: Record<string, unknown>,
    _items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    _order: Partial<FulfillmentOrderDTO> | undefined,
    _fulfillment: Partial<
      Omit<FulfillmentDTO, "provider_id" | "data" | "items">
    >
  ): Promise<CreateFulfillmentResult> {
    return {
      data,
      labels: [],
    };
  }

  async cancelFulfillment(): Promise<any> {
    return {};
  }

  async createReturnFulfillment(): Promise<any> {
    return {};
  }
}

export default ShippingWeightFulfillmentService;
