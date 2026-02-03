import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import * as pdfmake from "pdfmake/build/pdfmake";
import { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";

type InvoiceConfig = {
  company_name?: string | null;
  company_logo?: string | null;
  company_address?: string | null;
  company_phone?: string | null;
  company_email?: string | null;
  notes?: string | null;
};

type LineItem = {
  title: string;
  quantity: number;
  unit_price: number;
  total: number;
};

type Address = {
  first_name?: string | null;
  last_name?: string | null;
  address_1?: string | null;
  address_2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  phone?: string | null;
};

type GenerateInvoicePdfInput = {
  invoice: {
    id: string;
    display_id: number;
  };
  order: {
    id: string;
    display_id: number;
    created_at: string | Date;
    currency_code: string;
    items: LineItem[];
    subtotal: number;
    tax_total: number;
    shipping_total: number;
    discount_total: number;
    total: number;
    billing_address?: Address | null;
    shipping_address?: Address | null;
  };
  config: InvoiceConfig;
};

const formatCurrency = (amount: number, currencyCode: string): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
  }).format(amount / 100);
};

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatAddress = (address?: Address | null): string => {
  if (!address) return "N/A";

  const parts = [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.address_1,
    address.address_2,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.country_code?.toUpperCase(),
  ].filter(Boolean);

  return parts.join("\n");
};

export const generateInvoicePdfStep = createStep(
  "generate-invoice-pdf",
  async (input: GenerateInvoicePdfInput, { container }) => {
    const { invoice, order, config } = input;

    const invoiceNumber = `INV-${String(invoice.display_id).padStart(6, "0")}`;

    const headerContent: Content[] = [];

    if (config.company_name) {
      headerContent.push({
        text: config.company_name,
        style: "companyName",
        margin: [0, 0, 0, 5] as [number, number, number, number],
      });
    }

    if (config.company_address) {
      headerContent.push({
        text: config.company_address,
        style: "companyInfo",
      });
    }

    if (config.company_phone) {
      headerContent.push({
        text: `Tél: ${config.company_phone}`,
        style: "companyInfo",
      });
    }

    if (config.company_email) {
      headerContent.push({
        text: config.company_email,
        style: "companyInfo",
      });
    }

    const tableBody: TableCell[][] = [
      [
        { text: "Produit", style: "tableHeader" },
        { text: "Qté", style: "tableHeader", alignment: "center" as const },
        { text: "Prix unit.", style: "tableHeader", alignment: "right" as const },
        { text: "Total", style: "tableHeader", alignment: "right" as const },
      ],
    ];

    for (const item of order.items) {
      tableBody.push([
        { text: item.title },
        { text: item.quantity.toString(), alignment: "center" as const },
        { text: formatCurrency(item.unit_price, order.currency_code), alignment: "right" as const },
        { text: formatCurrency(item.total, order.currency_code), alignment: "right" as const },
      ]);
    }

    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          columns: [
            {
              width: "*",
              stack: headerContent,
            },
            {
              width: "auto",
              stack: [
                {
                  text: "FACTURE",
                  style: "invoiceTitle",
                  alignment: "right" as const,
                },
                {
                  text: invoiceNumber,
                  style: "invoiceNumber",
                  alignment: "right" as const,
                },
              ],
            },
          ],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 10,
              x2: 515,
              y2: 10,
              lineWidth: 1,
              lineColor: "#cccccc",
            },
          ],
        },
        {
          columns: [
            {
              width: "*",
              stack: [
                { text: "Date de facture:", style: "label" },
                { text: formatDate(new Date()), style: "value" },
                { text: "Date de commande:", style: "label", margin: [0, 10, 0, 0] as [number, number, number, number] },
                { text: formatDate(order.created_at), style: "value" },
                { text: "N° commande:", style: "label", margin: [0, 10, 0, 0] as [number, number, number, number] },
                { text: `#${order.display_id}`, style: "value" },
              ],
            },
            {
              width: "*",
              stack: [
                { text: "Adresse de facturation:", style: "label" },
                { text: formatAddress(order.billing_address), style: "value" },
              ],
            },
            {
              width: "*",
              stack: [
                { text: "Adresse de livraison:", style: "label" },
                { text: formatAddress(order.shipping_address), style: "value" },
              ],
            },
          ],
          margin: [0, 20, 0, 20] as [number, number, number, number],
        },
        {
          table: {
            headerRows: 1,
            widths: ["*", 50, 80, 80],
            body: tableBody,
          },
          layout: {
            hLineWidth: (i: number, node: any) =>
              i === 0 || i === 1 || i === node.table.body.length ? 1 : 0,
            vLineWidth: () => 0,
            hLineColor: () => "#cccccc",
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 8,
            paddingBottom: () => 8,
          },
        },
        {
          columns: [
            { width: "*", text: "" },
            {
              width: 200,
              stack: [
                {
                  columns: [
                    { text: "Sous-total:", style: "summaryLabel" },
                    {
                      text: formatCurrency(order.subtotal, order.currency_code),
                      style: "summaryValue",
                      alignment: "right" as const,
                    },
                  ],
                },
                {
                  columns: [
                    { text: "Taxes:", style: "summaryLabel" },
                    {
                      text: formatCurrency(order.tax_total, order.currency_code),
                      style: "summaryValue",
                      alignment: "right" as const,
                    },
                  ],
                },
                {
                  columns: [
                    { text: "Livraison:", style: "summaryLabel" },
                    {
                      text: formatCurrency(order.shipping_total, order.currency_code),
                      style: "summaryValue",
                      alignment: "right" as const,
                    },
                  ],
                },
                ...(order.discount_total > 0
                  ? [
                      {
                        columns: [
                          { text: "Remise:", style: "summaryLabel" },
                          {
                            text: `-${formatCurrency(order.discount_total, order.currency_code)}`,
                            style: "summaryValue",
                            alignment: "right" as const,
                          },
                        ],
                      },
                    ]
                  : []),
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: 5,
                      x2: 200,
                      y2: 5,
                      lineWidth: 1,
                      lineColor: "#000000",
                    },
                  ],
                },
                {
                  columns: [
                    { text: "Total:", style: "totalLabel" },
                    {
                      text: formatCurrency(order.total, order.currency_code),
                      style: "totalValue",
                      alignment: "right" as const,
                    },
                  ],
                },
              ],
              margin: [0, 20, 0, 0] as [number, number, number, number],
            },
          ],
        },
        ...(config.notes
          ? [
              {
                text: "Notes:",
                style: "label" as const,
                margin: [0, 30, 0, 5] as [number, number, number, number],
              },
              {
                text: config.notes,
                style: "notes" as const,
              },
            ]
          : []),
      ],
      styles: {
        companyName: {
          fontSize: 18,
          bold: true,
        },
        companyInfo: {
          fontSize: 10,
          color: "#666666",
        },
        invoiceTitle: {
          fontSize: 24,
          bold: true,
          color: "#333333",
        },
        invoiceNumber: {
          fontSize: 12,
          color: "#666666",
        },
        label: {
          fontSize: 10,
          bold: true,
          color: "#666666",
        },
        value: {
          fontSize: 10,
          color: "#333333",
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: "#333333",
          fillColor: "#f5f5f5",
        },
        summaryLabel: {
          fontSize: 10,
        },
        summaryValue: {
          fontSize: 10,
        },
        totalLabel: {
          fontSize: 12,
          bold: true,
        },
        totalValue: {
          fontSize: 12,
          bold: true,
        },
        notes: {
          fontSize: 9,
          italics: true,
          color: "#666666",
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
      pageMargins: [40, 40, 40, 60] as [number, number, number, number],
    };

    const pdfDoc = pdfmake.createPdf(docDefinition);
    const buffer = await pdfDoc.getBuffer();

    return new StepResponse(buffer);
  }
);
