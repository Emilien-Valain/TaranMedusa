import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { approveCompanySiretWorkflow } from "../../../../../../workflows/company/workflows";

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  await approveCompanySiretWorkflow.run({
    input: { company_id: req.params.id },
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
