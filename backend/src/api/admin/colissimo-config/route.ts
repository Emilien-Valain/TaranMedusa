import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { SHIPPING_WEIGHT_MODULE } from "../../../modules/shipping-weight";
import ShippingWeightModuleService from "../../../modules/shipping-weight/service";
import { AdminUpdateColissimoConfigType } from "./validators";

// On ne renvoie jamais les secrets en clair : juste un indicateur "défini".
function sanitize(config: any) {
  const { api_key, password, ...rest } = config ?? {};
  return {
    ...rest,
    api_key_set: Boolean(api_key),
    password_set: Boolean(password),
  };
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service =
    req.scope.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
  const config = await service.getOrCreateColissimoConfig();
  res.json({ colissimo_config: sanitize(config) });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateColissimoConfigType>,
  res: MedusaResponse
) => {
  const service =
    req.scope.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);
  const existing = await service.getOrCreateColissimoConfig();

  const body = req.body as Record<string, unknown>;
  // Les secrets ne sont mis à jour que si une valeur non vide est fournie
  // (un champ laissé vide conserve l'identifiant existant).
  const secretKeys = new Set(["api_key", "password"]);
  // Drapeaux de contrôle : ne sont pas des colonnes du modèle.
  const controlKeys = new Set(["clear_api_key", "clear_password"]);

  const update: Record<string, unknown> = { id: existing.id };
  for (const [key, value] of Object.entries(body)) {
    if (controlKeys.has(key)) {
      continue;
    }
    if (secretKeys.has(key)) {
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        update[key] = value;
      }
    } else if (value !== undefined) {
      update[key] = value;
    }
  }

  // Effacement explicite (prioritaire) : remet le secret à null en base.
  if (body.clear_api_key === true) {
    update.api_key = null;
  }
  if (body.clear_password === true) {
    update.password = null;
  }

  const updated = await service.updateColissimoConfigs(update as any);
  res.json({ colissimo_config: sanitize(updated) });
};
