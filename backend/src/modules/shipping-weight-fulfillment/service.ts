import {
  AbstractFulfillmentProviderService,
  MedusaError,
  Modules,
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
  IFileModuleService,
  IStockLocationService,
  Logger,
} from "@medusajs/framework/types";
import { SHIPPING_WEIGHT_MODULE } from "../shipping-weight";
import ShippingWeightModuleService from "../shipping-weight/service";
import {
  ColissimoAddress,
  generateColissimoLabel,
  isColissimoConfigured,
  toColissimoAddress,
} from "../../lib/colissimo";

type InjectedDependencies = {
  logger: Logger;
  [SHIPPING_WEIGHT_MODULE]?: ShippingWeightModuleService;
  [Modules.STOCK_LOCATION]?: IStockLocationService;
  [Modules.FILE]?: IFileModuleService;
};

export function colissimoTrackingUrl(trackingNumber: string): string {
  return `https://www.laposte.fr/outils/suivre-vos-envois?code=${encodeURIComponent(
    trackingNumber
  )}`;
}

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

  protected resolveStockLocationService(): IStockLocationService {
    const svc = (this.container_ as any)[Modules.STOCK_LOCATION];
    if (!svc) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Cannot resolve Stock Location module from fulfillment provider container."
      );
    }
    return svc;
  }

  protected resolveFileService(): IFileModuleService {
    const svc = (this.container_ as any)[Modules.FILE];
    if (!svc) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Cannot resolve File module from fulfillment provider container."
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
        colissimo_product_code: profile.colissimo_product_code ?? null,
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
    // On persiste les données d'option (id du profil + code produit Colissimo)
    // dans la méthode d'expédition, pour les retrouver dans createFulfillment.
    return { ...optionData, ...data };
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

  /** Code produit Colissimo : données d'option persistées, sinon profil. */
  protected async resolveColissimoProductCode(
    data: Record<string, any>,
    order: Partial<FulfillmentOrderDTO> | undefined
  ): Promise<string | null> {
    if (data?.colissimo_product_code) {
      return String(data.colissimo_product_code);
    }

    const profileId =
      data?.id ??
      (order?.shipping_methods ?? [])
        .map((sm) => (sm?.data as any)?.id)
        .find(Boolean);

    if (!profileId) return null;

    try {
      const profile = await this.resolveShippingWeightService().retrieveProfileWithTiers(
        String(profileId)
      );
      return (profile as any)?.colissimo_product_code ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Poids (kg) des articles réellement expédiés.
   * Le poids variant (en grammes) est fourni par la commande étendue
   * (`order.items[].variant.weight`, chargé par le workflow de fulfillment).
   */
  protected computeShippedWeightKg(
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined
  ): number {
    const orderItems = (order?.items ?? []) as any[];

    const byLineItem = new Map<
      string,
      { weightGrams: number; quantity: number }
    >();
    for (const oi of orderItems) {
      const weightGrams = Number(
        oi?.variant?.weight ?? oi?.product?.weight ?? 0
      );
      byLineItem.set(oi.id, {
        weightGrams,
        quantity: Number(oi.quantity ?? 0),
      });
    }

    let totalGrams = 0;
    if (items && items.length) {
      // Quantités réellement expédiées (gère les expéditions partielles).
      for (const fi of items) {
        const ref = fi.line_item_id ? byLineItem.get(fi.line_item_id) : undefined;
        if (ref) totalGrams += ref.weightGrams * Number(fi.quantity ?? 0);
      }
    } else {
      for (const { weightGrams, quantity } of byLineItem.values()) {
        totalGrams += weightGrams * quantity;
      }
    }

    return totalGrams / 1000;
  }

  /**
   * Adresse expéditeur. Ordre de priorité :
   * stock location → config admin → variables d'environnement.
   */
  protected async resolveSenderAddress(
    locationId: string | undefined,
    config: Record<string, any> | undefined
  ): Promise<ColissimoAddress> {
    const fallbackName =
      config?.sender_name || process.env.COLISSIMO_SENDER_NAME || null;

    if (locationId) {
      try {
        const location = await this.resolveStockLocationService().retrieveStockLocation(
          locationId,
          { relations: ["address"] }
        );
        const address = (location as any)?.address;
        if (address?.address_1) {
          return toColissimoAddress(address, {
            fallbackCompanyName: fallbackName ?? (location as any)?.name,
          });
        }
      } catch (e) {
        this.logger_?.warn(
          `Colissimo: adresse du stock location ${locationId} indisponible, repli config/env (${
            (e as Error).message
          }).`
        );
      }
    }

    // Repli : config admin puis variables d'environnement.
    return {
      companyName: fallbackName,
      line2: config?.sender_street || process.env.COLISSIMO_SENDER_STREET || "",
      line1:
        config?.sender_street2 || process.env.COLISSIMO_SENDER_STREET2 || null,
      city: config?.sender_city || process.env.COLISSIMO_SENDER_CITY || "",
      zipCode: config?.sender_zip || process.env.COLISSIMO_SENDER_ZIP || "",
      countryCode: (
        config?.sender_country ||
        process.env.COLISSIMO_SENDER_COUNTRY ||
        "FR"
      ).toUpperCase(),
      phoneNumber:
        config?.sender_phone || process.env.COLISSIMO_SENDER_PHONE || null,
      email: config?.sender_email || process.env.COLISSIMO_SENDER_EMAIL || null,
    };
  }

  /** Stocke le PDF d'étiquette via le File Module et renvoie son URL. */
  protected async storeLabel(
    content: Buffer,
    mimeType: string,
    filename: string
  ): Promise<string> {
    const file = await this.resolveFileService().createFiles({
      filename,
      mimeType,
      content: content.toString("base64"),
      access: "public",
    });
    return file.url;
  }

  async createFulfillment(
    data: Record<string, unknown>,
    items: Partial<Omit<FulfillmentItemDTO, "fulfillment">>[],
    order: Partial<FulfillmentOrderDTO> | undefined,
    fulfillment: Partial<Omit<FulfillmentDTO, "provider_id" | "data" | "items">>
  ): Promise<CreateFulfillmentResult> {
    const existing = (data ?? {}) as Record<string, any>;

    // 1. Repli manuel : un numéro de suivi a été saisi à la main.
    if (existing.manual_tracking_number) {
      const tn = String(existing.manual_tracking_number);
      return {
        data: {
          ...existing,
          colissimo_tracking_number: tn,
          colissimo_manual: true,
        },
        labels: [
          {
            tracking_number: tn,
            tracking_url: colissimoTrackingUrl(tn),
            label_url: existing.colissimo_label_url ?? "",
          },
        ],
      };
    }

    // 2. Garde anti-doublon : colis déjà affranchi (pas de seconde facturation).
    if (existing.colissimo_parcel_number) {
      const tn = String(existing.colissimo_parcel_number);
      return {
        data: existing,
        labels: [
          {
            tracking_number: tn,
            tracking_url: colissimoTrackingUrl(tn),
            label_url: existing.colissimo_label_url ?? "",
          },
        ],
      };
    }

    // 3. Code produit Colissimo : si absent, profil non-Colissimo → manuel.
    const productCode = await this.resolveColissimoProductCode(existing, order);
    if (!productCode) {
      return { data: existing, labels: [] };
    }

    // Réglages admin (identifiants, format, expéditeur, bascule manuelle).
    const config = (await this.resolveShippingWeightService().getOrCreateColissimoConfig()) as any;

    // Bascule 100% manuelle : on ne génère pas d'étiquette automatiquement.
    if (config?.enabled === false) {
      return { data: existing, labels: [] };
    }

    const credentials = {
      apiKey: config?.api_key ?? null,
      contractNumber: config?.contract_number ?? null,
      password: config?.password ?? null,
    };

    if (!isColissimoConfigured(credentials)) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        "Colissimo non configuré : renseignez les identifiants dans l'admin (Livraison au poids → Configuration Colissimo) ou via les variables d'environnement, ou désactivez Colissimo pour expédier manuellement."
      );
    }

    // 4. Poids des articles expédiés.
    const weightKg = this.computeShippedWeightKg(items, order);

    // 5. Destinataire (adresse de livraison du fulfillment) + expéditeur.
    const addressee = toColissimoAddress(
      (fulfillment?.delivery_address ?? order?.shipping_address ?? {}) as any,
      { email: order?.email }
    );
    const sender = await this.resolveSenderAddress(
      fulfillment?.location_id,
      config
    );

    // 6. Appel Colissimo. En cas d'échec : exception → fulfillment non créé.
    let label;
    try {
      label = await generateColissimoLabel({
        productCode,
        weightKg,
        sender,
        addressee,
        orderNumber: order?.display_id
          ? String(order.display_id)
          : order?.id,
        commercialName: sender.companyName ?? undefined,
        addresseeParcelRef: order?.id,
        outputPrintingType: config?.label_format ?? undefined,
        credentials,
      });
    } catch (e) {
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Échec de l'édition de l'étiquette Colissimo : ${
          (e as Error).message
        }`
      );
    }

    // 7. Stockage du PDF.
    const ref = order?.display_id ?? order?.id ?? label.parcelNumber;
    const labelUrl = await this.storeLabel(
      label.label,
      label.labelContentType,
      `colissimo-${ref}-${label.parcelNumber}.${label.labelExtension}`
    );

    return {
      data: {
        ...existing,
        colissimo_parcel_number: label.parcelNumber,
        colissimo_parcel_number_partner: label.parcelNumberPartner ?? null,
        colissimo_product_code: productCode,
        colissimo_label_url: labelUrl,
        colissimo_weight_kg: weightKg,
      },
      labels: [
        {
          tracking_number: label.parcelNumber,
          tracking_url: colissimoTrackingUrl(label.parcelNumber),
          label_url: labelUrl,
        },
      ],
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
