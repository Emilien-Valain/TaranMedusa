import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import {
  deleteShippingWeightTierWorkflow,
  updateShippingWeightTierWorkflow,
} from "../../../../../../../workflows/shipping-weight/workflows";
import { AdminUpdateWeightTierType } from "../../../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateWeightTierType>,
  res: MedusaResponse
) => {
  const { tierId } = req.params;

  const { result } = await updateShippingWeightTierWorkflow(req.scope).run({
    input: {
      id: tierId,
      ...req.body,
    },
  });

  res.json({ tier: result });
};

export const DELETE = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { tierId } = req.params;

  await deleteShippingWeightTierWorkflow(req.scope).run({
    input: { id: tierId },
  });

  res.json({ id: tierId, object: "shipping_weight_tier", deleted: true });
};
