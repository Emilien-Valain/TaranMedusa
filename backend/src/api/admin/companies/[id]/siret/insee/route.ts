import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/utils";
import { lookupSiret } from "../../../../../../lib/insee-sirene";

// Interrogation INSEE en direct, sans modifier le statut de validation.
export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data: companies } = await query.graph(
    {
      entity: "companies",
      fields: ["siret"],
      filters: { id: req.params.id },
    },
    { throwIfKeyNotFound: true }
  );

  const siret = companies[0].siret;
  if (!siret) {
    return res.json({ result: null });
  }

  try {
    res.json({ result: await lookupSiret(siret) });
  } catch (e: any) {
    res.json({
      result: { found: false, reason: "api_error", message: e?.message },
    });
  }
};
