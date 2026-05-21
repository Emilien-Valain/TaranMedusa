import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { createCompaniesWorkflow } from "../../../workflows/company/workflows/create-companies";
import { submitCompanySiretWorkflow } from "../../../workflows/company/workflows";
import { StoreCreateCompanyType } from "./validators";

export const POST = async (
  req: AuthenticatedMedusaRequest<
    StoreCreateCompanyType | StoreCreateCompanyType[]
  >,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const inputs = Array.isArray(req.validatedBody)
    ? req.validatedBody
    : [req.validatedBody];

  const { result: createdCompanies } = await createCompaniesWorkflow.run({
    input: inputs.map(({ siret: _omitted, ...company }) => ({ ...company })),
    container: req.scope,
  });

  for (let i = 0; i < createdCompanies.length; i++) {
    const siret = inputs[i]?.siret;
    if (siret && siret.replace(/\s/g, "").length > 0) {
      await submitCompanySiretWorkflow
        .run({
          input: {
            company_id: createdCompanies[i].id,
            siret: siret.replace(/\s/g, ""),
          },
          container: req.scope,
        })
        .catch((err) => {
          req.scope
            .resolve("logger" as any)
            ?.warn?.(
              `SIRET submission failed for company ${createdCompanies[i].id}: ${err?.message}`
            );
        });
    }
  }

  const { data: companies } = await query.graph(
    {
      entity: "companies",
      fields: req.queryConfig.fields,
      filters: { id: createdCompanies.map((company) => company.id) },
    },
    { throwIfKeyNotFound: true }
  );

  res.json({ companies });
};
