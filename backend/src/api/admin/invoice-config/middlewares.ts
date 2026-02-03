import { validateAndTransformBody } from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { AdminUpdateInvoiceConfig } from "./validators";

export const adminInvoiceConfigMiddlewares: MiddlewareRoute[] = [
  {
    method: ["POST"],
    matcher: "/admin/invoice-config",
    middlewares: [validateAndTransformBody(AdminUpdateInvoiceConfig)],
  },
];
