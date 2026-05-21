import { createWorkflow, WorkflowResponse } from "@medusajs/workflows-sdk";
import { approveCompanySiretStep } from "../steps";

type Input = {
  company_id: string;
};

export const approveCompanySiretWorkflow = createWorkflow(
  "approve-company-siret",
  function (input: Input) {
    return new WorkflowResponse(approveCompanySiretStep(input));
  }
);
