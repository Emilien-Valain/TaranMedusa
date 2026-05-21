import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  CreateTierInput,
  UpdateTierInput,
  createTierStep,
  deleteTierStep,
  updateTierStep,
} from "../steps";

export const createShippingWeightTierWorkflow = createWorkflow(
  "create-shipping-weight-tier",
  function (input: CreateTierInput) {
    const tier = createTierStep(input);
    return new WorkflowResponse(tier);
  }
);

export const updateShippingWeightTierWorkflow = createWorkflow(
  "update-shipping-weight-tier",
  function (input: UpdateTierInput) {
    const tier = updateTierStep(input);
    return new WorkflowResponse(tier);
  }
);

export const deleteShippingWeightTierWorkflow = createWorkflow(
  "delete-shipping-weight-tier",
  function (input: { id: string }) {
    const result = deleteTierStep(input.id);
    return new WorkflowResponse(result);
  }
);
