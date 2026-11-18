import { emitEventStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { rejectCompanySiretStep } from "../steps";

type Input = {
  company_id: string;
  reason: string;
};

export const rejectCompanySiretWorkflow = createWorkflow(
  "reject-company-siret",
  function (input: Input) {
    const company = rejectCompanySiretStep(input);

    // Le storefront met en cache le client (et donc le mode HT/TTC) : on le prévient.
    emitEventStep({
      eventName: "company.siret_rejected",
      data: { id: input.company_id },
    });

    return new WorkflowResponse(company);
  }
);
