import { Module } from "@medusajs/framework/utils";
import ShippingWeightModuleService from "./service";

export const SHIPPING_WEIGHT_MODULE = "shippingWeight";

export default Module(SHIPPING_WEIGHT_MODULE, {
  service: ShippingWeightModuleService,
});
