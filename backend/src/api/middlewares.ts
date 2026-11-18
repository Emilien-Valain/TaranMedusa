import { allowFields } from "@medusajs/framework/http";
import { defineMiddlewares } from "@medusajs/medusa";
import { adminMiddlewares } from "./admin/middlewares";
import { storeMiddlewares } from "./store/middlewares";

// Depuis Medusa 2.21, les routes Store retirent silencieusement tout champ absent
// de leur liste autorisée : on y ajoute les liens B2B lus par le storefront.
// Pas de `method` ici, sinon le middleware passe après la validation et n'a aucun effet.
export default defineMiddlewares({
  routes: [
    ...adminMiddlewares,
    ...storeMiddlewares,
    {
      matcher: "/store/customers/me",
      middlewares: [allowFields("employee", "employee.company")],
    },
    {
      matcher: "/store/carts/:id",
      middlewares: [
        allowFields(
          "company",
          "company.approval_settings",
          "approvals",
          "approval_status"
        ),
      ],
    },
    {
      matcher: "/store/orders",
      middlewares: [allowFields("customer")],
    },
  ],
});
