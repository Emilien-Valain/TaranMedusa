import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils";
import { generateInvoicePdfWorkflow } from "../../../../../workflows/invoice/workflows";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;
  const customerId = req.auth_context.actor_id;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [order],
  } = await query.graph(
    {
      entity: "order",
      fields: ["id", "customer_id"],
      filters: {
        id,
      },
    },
    { throwIfKeyNotFound: true }
  );

  if (order.customer_id !== customerId) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "You are not authorized to access this order's invoice"
    );
  }

  const { result } = await generateInvoicePdfWorkflow.run({
    input: { order_id: id },
    container: req.scope,
  });

  const invoiceNumber = `INV-${String(result.invoice.display_id).padStart(6, "0")}`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${invoiceNumber}.pdf"`
  );

  res.send(result.pdf);
};
