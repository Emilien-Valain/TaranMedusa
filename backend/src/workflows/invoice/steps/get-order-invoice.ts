import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { INVOICE_MODULE } from "../../../modules/invoice";
import InvoiceModuleService from "../../../modules/invoice/service";

type GetOrderInvoiceInput = {
  order_id: string;
};

export const getOrderInvoiceStep = createStep(
  "get-order-invoice",
  async (input: GetOrderInvoiceInput, { container }) => {
    const invoiceService =
      container.resolve<InvoiceModuleService>(INVOICE_MODULE);

    const invoice = await invoiceService.getOrCreateInvoice(input.order_id);

    return new StepResponse(invoice, invoice.id);
  },
  async (invoiceId: string, { container }) => {
    const invoiceService =
      container.resolve<InvoiceModuleService>(INVOICE_MODULE);

    await invoiceService.deleteInvoices(invoiceId);
  }
);
