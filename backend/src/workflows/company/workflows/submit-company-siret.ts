import { emitEventStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { submitCompanySiretStep } from "../steps";

type Input = {
  company_id: string;
  siret: string;
};

export const submitCompanySiretWorkflow = createWorkflow(
  "submit-company-siret",
  function (input: Input) {
    const result = submitCompanySiretStep(input);

    // La vérification INSEE peut valider (ou rejeter) immédiatement.
    emitEventStep({
      eventName: "company.siret_submitted",
      data: { id: input.company_id },
    });

    return new WorkflowResponse(result);
  }
);
