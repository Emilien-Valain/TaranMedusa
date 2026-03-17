import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

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
  }).format(amount);
};

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatAddress = (address?: Address | null): string[] => {
  if (!address) return ["N/A"];

  const lines = [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.address_1,
    address.address_2,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.country_code?.toUpperCase(),
  ].filter(Boolean) as string[];

  return lines.length > 0 ? lines : ["N/A"];
};

export const generateInvoicePdfStep = createStep(
  "generate-invoice-pdf",
  async (input: GenerateInvoicePdfInput) => {
    const { invoice, order, config } = input;

    const invoiceNumber = `INV-${String(invoice.display_id).padStart(6, "0")}`;

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

    // Header - Company info on left, Invoice title on right
    let startY = 50;
    let companyY = startY;

    // Company logo (if exists)
    if (config.company_logo) {
      try {
        let logoPath = config.company_logo;

        // If it's a relative path, resolve it from the static folder
        if (!logoPath.startsWith("/") && !logoPath.startsWith("http")) {
          logoPath = path.join(process.cwd(), "static", logoPath);
        }

        // Check if file exists for local paths
        if (!logoPath.startsWith("http") && fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, startY, { width: 80 });
          companyY = startY + 90; // Move text below logo
        }
      } catch (error) {
        console.error("Error loading logo:", error);
        // Continue without logo
      }
    }

    // Company info (left side)
    doc.fontSize(18).font("Helvetica-Bold");
    if (config.company_name) {
      doc.text(config.company_name, 50, companyY);
      companyY += 25;
    } else {
      companyY += 25;
    }

    doc.fontSize(10).font("Helvetica").fillColor("#666666");

    if (config.company_address) {
      doc.text(config.company_address, 50, companyY);
      companyY += 15;
    }
    if (config.company_phone) {
      doc.text(`Tél: ${config.company_phone}`, 50, companyY);
      companyY += 15;
    }
    if (config.company_email) {
      doc.text(config.company_email, 50, companyY);
    }

    // Invoice title (right side)
    doc.fontSize(24).font("Helvetica-Bold").fillColor("#333333");
    doc.text("FACTURE", 400, startY, { width: 150, align: "right" });

    doc.fontSize(12).font("Helvetica").fillColor("#666666");
    doc.text(invoiceNumber, 400, startY + 30, { width: 150, align: "right" });

    // Calculate line position based on content
    const lineY = Math.max(companyY + 20, 130);

    // Horizontal line
    doc.moveTo(50, lineY).lineTo(560, lineY).strokeColor("#cccccc").stroke();

    // Order info and addresses
    const infoY = lineY + 20;

    // Left column - Order info
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#666666");
    doc.text("Date de facture:", 50, infoY);
    doc.font("Helvetica").fillColor("#333333");
    doc.text(formatDate(new Date()), 50, infoY + 12);

    doc.font("Helvetica-Bold").fillColor("#666666");
    doc.text("Date de commande:", 50, infoY + 35);
    doc.font("Helvetica").fillColor("#333333");
    doc.text(formatDate(order.created_at), 50, infoY + 47);

    doc.font("Helvetica-Bold").fillColor("#666666");
    doc.text("N° commande:", 50, infoY + 70);
    doc.font("Helvetica").fillColor("#333333");
    doc.text(`#${order.display_id}`, 50, infoY + 82);

    // Middle column - Billing address
    doc.font("Helvetica-Bold").fillColor("#666666");
    doc.text("Adresse de facturation:", 220, infoY);
    doc.font("Helvetica").fillColor("#333333");
    const billingLines = formatAddress(order.billing_address);
    billingLines.forEach((line, i) => {
      doc.text(line, 220, infoY + 12 + i * 12);
    });

    // Right column - Shipping address
    doc.font("Helvetica-Bold").fillColor("#666666");
    doc.text("Adresse de livraison:", 400, infoY);
    doc.font("Helvetica").fillColor("#333333");
    const shippingLines = formatAddress(order.shipping_address);
    shippingLines.forEach((line, i) => {
      doc.text(line, 400, infoY + 12 + i * 12);
    });

    // Items table - position based on address section
    const tableTop = infoY + 130;
    const tableLeft = 50;

    // Table header
    doc.rect(tableLeft, tableTop, 510, 25).fill("#f5f5f5");
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#333333");
    doc.text("Produit", tableLeft + 10, tableTop + 8);
    doc.text("Qté", tableLeft + 300, tableTop + 8, { width: 50, align: "center" });
    doc.text("Prix unit.", tableLeft + 360, tableTop + 8, { width: 70, align: "right" });
    doc.text("Total", tableLeft + 440, tableTop + 8, { width: 60, align: "right" });

    // Table rows
    let rowY = tableTop + 30;
    doc.font("Helvetica").fillColor("#333333");

    for (const item of order.items) {
      doc.text(item.title, tableLeft + 10, rowY, { width: 280 });
      doc.text(item.quantity.toString(), tableLeft + 300, rowY, { width: 50, align: "center" });
      doc.text(formatCurrency(item.unit_price, order.currency_code), tableLeft + 360, rowY, { width: 70, align: "right" });
      doc.text(formatCurrency(item.total, order.currency_code), tableLeft + 440, rowY, { width: 60, align: "right" });
      rowY += 25;
    }

    // Line under items
    doc.moveTo(tableLeft, rowY).lineTo(tableLeft + 510, rowY).strokeColor("#cccccc").stroke();

    // Summary (right aligned)
    const summaryX = 380;
    let summaryY = rowY + 20;

    doc.font("Helvetica").fontSize(10);

    doc.text("Sous-total:", summaryX, summaryY);
    doc.text(formatCurrency(order.subtotal, order.currency_code), summaryX + 80, summaryY, { width: 70, align: "right" });
    summaryY += 18;

    doc.text("Taxes:", summaryX, summaryY);
    doc.text(formatCurrency(order.tax_total, order.currency_code), summaryX + 80, summaryY, { width: 70, align: "right" });
    summaryY += 18;

    doc.text("Livraison:", summaryX, summaryY);
    doc.text(formatCurrency(order.shipping_total, order.currency_code), summaryX + 80, summaryY, { width: 70, align: "right" });
    summaryY += 18;

    if (order.discount_total > 0) {
      doc.text("Remise:", summaryX, summaryY);
      doc.text(`-${formatCurrency(order.discount_total, order.currency_code)}`, summaryX + 80, summaryY, { width: 70, align: "right" });
      summaryY += 18;
    }

    // Total line
    doc.moveTo(summaryX, summaryY).lineTo(summaryX + 150, summaryY).strokeColor("#000000").stroke();
    summaryY += 10;

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Total:", summaryX, summaryY);
    doc.text(formatCurrency(order.total, order.currency_code), summaryX + 80, summaryY, { width: 70, align: "right" });

    // Notes
    if (config.notes) {
      summaryY += 50;
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#666666");
      doc.text("Notes:", 50, summaryY);
      doc.font("Helvetica-Oblique").fillColor("#666666");
      doc.text(config.notes, 50, summaryY + 15, { width: 400 });
    }

      doc.end();
    });

    return new StepResponse(buffer);
  }
);
