import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { AdminUpdateColissimoConfig } from "./validators";

export const adminColissimoConfigMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/colissimo-config",
    middlewares: [validateAndTransformBody(AdminUpdateColissimoConfig)],
  },
];
