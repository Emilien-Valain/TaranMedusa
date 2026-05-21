import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  CreateProfileInput,
  UpdateProfileInput,
  createProfileStep,
  deleteProfileStep,
  updateProfileStep,
} from "../steps";

export const createShippingWeightProfileWorkflow = createWorkflow(
  "create-shipping-weight-profile",
  function (input: CreateProfileInput) {
    const profile = createProfileStep(input);
    return new WorkflowResponse(profile);
  }
);

export const updateShippingWeightProfileWorkflow = createWorkflow(
  "update-shipping-weight-profile",
  function (input: UpdateProfileInput) {
    const profile = updateProfileStep(input);
    return new WorkflowResponse(profile);
  }
);

export const deleteShippingWeightProfileWorkflow = createWorkflow(
  "delete-shipping-weight-profile",
  function (input: { id: string }) {
    const result = deleteProfileStep(input.id);
    return new WorkflowResponse(result);
  }
);
