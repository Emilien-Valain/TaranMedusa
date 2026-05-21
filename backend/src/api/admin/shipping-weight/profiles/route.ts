import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { SHIPPING_WEIGHT_MODULE } from "../../../../modules/shipping-weight";
import ShippingWeightModuleService from "../../../../modules/shipping-weight/service";
import { createShippingWeightProfileWorkflow } from "../../../../workflows/shipping-weight/workflows";
import { AdminCreateShippingProfileType } from "../validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const service =
    req.scope.resolve<ShippingWeightModuleService>(SHIPPING_WEIGHT_MODULE);

  const profiles = await service.listProfilesWithTiers();

  res.json({ profiles });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateShippingProfileType>,
  res: MedusaResponse
) => {
  const { result } = await createShippingWeightProfileWorkflow(req.scope).run({
    input: req.body,
  });

  res.json({ profile: result });
};
