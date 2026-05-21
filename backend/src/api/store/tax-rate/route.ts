import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const countryCode = (
    (req.query.country_code as string) || "fr"
  ).toLowerCase();

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: regions } = await query.graph({
    entity: "tax_region",
    fields: [
      "id",
      "country_code",
      "province_code",
      "tax_rates.id",
      "tax_rates.rate",
      "tax_rates.is_default",
      "tax_rates.code",
      "tax_rates.name",
    ],
    filters: { country_code: countryCode } as any,
  });

  const region = regions.find(
    (r: any) => !r.province_code
  ) as any | undefined;

  if (!region) {
    res.json({ country_code: countryCode, rate: 0, found: false });
    return;
  }

  const defaultRate = (region.tax_rates || []).find(
    (r: any) => r.is_default
  );

  res.json({
    country_code: countryCode,
    rate: defaultRate?.rate ?? 0,
    name: defaultRate?.name ?? null,
    found: Boolean(defaultRate),
  });
};
