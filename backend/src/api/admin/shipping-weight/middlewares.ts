import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import {
  AdminCreateShippingProfile,
  AdminCreateWeightTier,
  AdminUpdateShippingProfile,
  AdminUpdateWeightTier,
} from "./validators";

export const adminShippingWeightMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/shipping-weight/profiles",
    middlewares: [validateAndTransformBody(AdminCreateShippingProfile)],
  },
  {
    method: ["POST"],
    matcher: "/admin/shipping-weight/profiles/:id",
    middlewares: [validateAndTransformBody(AdminUpdateShippingProfile)],
  },
  {
    method: ["POST"],
    matcher: "/admin/shipping-weight/profiles/:id/tiers",
    middlewares: [validateAndTransformBody(AdminCreateWeightTier)],
  },
  {
    method: ["POST"],
    matcher: "/admin/shipping-weight/profiles/:id/tiers/:tierId",
    middlewares: [validateAndTransformBody(AdminUpdateWeightTier)],
  },
];
