import { emitEventStep } from "@medusajs/medusa/core-flows";
import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { approveCompanySiretStep } from "../steps";

type Input = {
  company_id: string;
};

export const approveCompanySiretWorkflow = createWorkflow(
  "approve-company-siret",
  function (input: Input) {
    const company = approveCompanySiretStep(input);

    // Le storefront met en cache le client (et donc le mode HT/TTC) : on le prévient.
    emitEventStep({
      eventName: "company.siret_approved",
      data: { id: input.company_id },
    });

    return new WorkflowResponse(company);
  }
);
