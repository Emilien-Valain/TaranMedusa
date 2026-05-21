import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { submitCompanySiretWorkflow } from "../../../../../workflows/company/workflows";
import { StoreSubmitSiretType } from "../../validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<StoreSubmitSiretType>,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  await submitCompanySiretWorkflow.run({
    input: {
      company_id: req.params.id,
      siret: req.validatedBody.siret,
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
