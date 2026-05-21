import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { rejectCompanySiretWorkflow } from "../../../../../../workflows/company/workflows";
import { AdminRejectSiretType } from "../../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminRejectSiretType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  await rejectCompanySiretWorkflow.run({
    input: {
      company_id: req.params.id,
      reason: req.validatedBody.reason,
    },
    container: req.scope,
  });

  const { data: companies } = await query.graph(
    {
      entity: "companies",
      fields: req.queryConfig.fields,
      filters: { id: req.params.id },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ company: companies[0] });
};
