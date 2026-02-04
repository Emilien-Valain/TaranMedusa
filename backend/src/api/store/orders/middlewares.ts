import { authenticate } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";

export const storeOrdersMiddlewares: MiddlewareRoute[] = [
  {
    method: "GET",
    matcher: "/store/orders/:id/invoice",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  },
];
