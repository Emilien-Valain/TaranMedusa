import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { SHIPPING_WEIGHT_MODULE } from "../../../../../modules/shipping-weight";
import ShippingWeightModuleService from "../../../../../modules/shipping-weight/service";
import {
  deleteShippingWeightProfileWorkflow,
  updateShippingWeightProfileWorkflow,
} from "../../../../../workflows/shipping-weight/workflows";
import { AdminUpdateShippingProfileType } from "../../validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const service =
    req.scope.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);

  const profile = await service.retrieveProfileWithTiers(id);

  if (!profile) {
    res.status(404).json({ message: "Profil introuvable" });
    return;
  }

  res.json({ profile });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateShippingProfileType>,
  res: MedusaResponse
) => {
  const { id } = req.params;

  const { result } = await updateShippingWeightProfileWorkflow(req.scope).run({
    input: {
      id,
      ...req.body,
    },
  });

  res.json({ profile: result });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;

  await deleteShippingWeightProfileWorkflow(req.scope).run({
    input: { id },
  });

  res.json({ id, object: "shipping_weight_profile", deleted: true });
};
