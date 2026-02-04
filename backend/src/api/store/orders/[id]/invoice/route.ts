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
  try {
    const { id } = req.params;
    const customerId = req.auth_context?.actor_id;

    if (!customerId) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        "You must be logged in to access invoices"
      );
    }

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

    if (!order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        `Order ${id} not found`
      );
    }

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

    // Convert the pdf data back to Buffer if it was serialized
    let pdfBuffer: Buffer;
    if (Buffer.isBuffer(result.pdf)) {
      pdfBuffer = result.pdf;
    } else if (result.pdf?.type === "Buffer" && Array.isArray(result.pdf.data)) {
      // Handle serialized Buffer format { type: "Buffer", data: [...] }
      pdfBuffer = Buffer.from(result.pdf.data);
    } else if (typeof result.pdf === "object" && result.pdf.data) {
      pdfBuffer = Buffer.from(result.pdf.data);
    } else {
      pdfBuffer = Buffer.from(result.pdf as any);
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", pdfBuffer.length);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoiceNumber}.pdf"`
    );

    res.end(pdfBuffer);
  } catch (error) {
    console.error("Invoice generation error:", error);
    throw error;
  }
};
