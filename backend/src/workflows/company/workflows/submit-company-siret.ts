import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { submitCompanySiretStep } from "../steps";

type Input = {
  company_id: string;
  siret: string;
};

export const submitCompanySiretWorkflow = createWorkflow(
  "submit-company-siret",
  function (input: Input) {
    return new WorkflowResponse(submitCompanySiretStep(input));
  }
);
