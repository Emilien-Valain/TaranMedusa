import { MiddlewareRoute } from "@medusajs/medusa";
import { adminCompaniesMiddlewares } from "./companies/middlewares";
import { adminQuotesMiddlewares } from "./quotes/middlewares";
import { adminApprovalsMiddlewares } from "./approvals/middlewares";
import { adminInvoiceConfigMiddlewares } from "./invoice-config/middlewares";
import { adminShippingWeightMiddlewares } from "./shipping-weight/middlewares";

export const adminMiddlewares: MiddlewareRoute[] = [
  ...adminCompaniesMiddlewares,
  ...adminQuotesMiddlewares,
  ...adminApprovalsMiddlewares,
  ...adminInvoiceConfigMiddlewares,
  ...adminShippingWeightMiddlewares,
];
