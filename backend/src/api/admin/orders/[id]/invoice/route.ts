import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { generateInvoicePdfWorkflow } from "../../../../../workflows/invoice/workflows";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const { id } = req.params;

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
