import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { rejectCompanySiretStep } from "../steps";

type Input = {
  company_id: string;
  reason: string;
};

export const rejectCompanySiretWorkflow = createWorkflow(
  "reject-company-siret",
  function (input: Input) {
    return new WorkflowResponse(rejectCompanySiretStep(input));
  }
);
