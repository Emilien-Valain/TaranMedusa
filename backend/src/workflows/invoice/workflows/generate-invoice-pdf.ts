import { createWorkflow, WorkflowResponse, transform } from "@medusajs/framework/workflows-sdk";
import { useQueryGraphStep } from "@medusajs/medusa/core-flows";
import { getOrderInvoiceStep, generateInvoicePdfStep } from "../steps";
import { INVOICE_MODULE } from "../../../modules/invoice";
import InvoiceModuleService from "../../../modules/invoice/service";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type GenerateInvoicePdfWorkflowInput = {
  order_id: string;
};

const getInvoiceConfigStep = createStep(
  "get-invoice-config",
  async (input: Record<string, never>, { container }) => {
    const invoiceService =
      container.resolve<InvoiceModuleService>(INVOICE_MODULE);

    const config = await invoiceService.getOrCreateConfig();

    return new StepResponse(config);
  }
);

export const generateInvoicePdfWorkflow = createWorkflow(
  "generate-invoice-pdf",
  function (input: GenerateInvoicePdfWorkflowInput) {
    const { data: orders } = useQueryGraphStep({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "created_at",
        "currency_code",
        "items.*",
        "subtotal",
        "tax_total",
        "shipping_total",
        "discount_total",
        "total",
        "billing_address.*",
        "shipping_address.*",
      ],
      filters: {
        id: input.order_id,
      },
    });

    const order = transform(orders, (orders) => orders[0]);

    const invoice = getOrderInvoiceStep({ order_id: input.order_id });

    const config = getInvoiceConfigStep({});

    const pdfInput = transform(
      { invoice, order, config },
      ({ invoice, order, config }) => ({
        invoice: {
          id: invoice.id,
          display_id: invoice.display_id,
        },
        order: {
          id: order.id,
          display_id: order.display_id,
          created_at: order.created_at,
          currency_code: order.currency_code,
          items: order.items.map((item: any) => ({
            title: item.title,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total,
          })),
          subtotal: order.subtotal,
          tax_total: order.tax_total,
          shipping_total: order.shipping_total,
          discount_total: order.discount_total,
          total: order.total,
          billing_address: order.billing_address,
          shipping_address: order.shipping_address,
        },
        config: {
          company_name: config.company_name,
          company_logo: config.company_logo,
          company_address: config.company_address,
          company_phone: config.company_phone,
          company_email: config.company_email,
          notes: config.notes,
        },
      })
    );

    const pdfBuffer = generateInvoicePdfStep(pdfInput);

    return new WorkflowResponse({
      pdf: pdfBuffer,
      invoice,
    });
  }
);
