import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { createShippingWeightTierWorkflow } from "../../../../../../workflows/shipping-weight/workflows";
import { AdminCreateWeightTierType } from "../../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminCreateWeightTierType>,
  res: MedusaResponse
) => {
  const { id } = req.params;

  const { result } = await createShippingWeightTierWorkflow(req.scope).run({
    input: {
      profile_id: id,
      ...req.body,
    },
  });

  res.json({ tier: result });
};
