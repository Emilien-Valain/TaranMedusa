import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import ShippingWeightFulfillmentService from "./service";

export default ModuleProvider(Modules.FULFILLMENT, {
  services: [ShippingWeightFulfillmentService],
});
