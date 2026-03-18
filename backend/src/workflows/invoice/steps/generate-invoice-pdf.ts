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

// Taran Industrie brand colors
const COLORS = {
  navyBlue: "#0d2b5e",
  mediumBlue: "#1565c0",
  lightBlue: "#0099d6",
  white: "#ffffff",
  lightGray: "#f5f8fc",
  borderGray: "#dde4ee",
  textDark: "#1a1a2e",
  textMuted: "#4a5568",
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

    const invoiceNumber = `FAC-${String(invoice.display_id).padStart(6, "0")}`;

    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 0, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const pageWidth = 595;
      const pageHeight = 841;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // ── HEADER BAND ──────────────────────────────────────────────
      // Navy blue top band
      doc.rect(0, 0, pageWidth, 90).fill(COLORS.navyBlue);

      // Light blue accent stripe at bottom of header
      doc.rect(0, 88, pageWidth, 4).fill(COLORS.lightBlue);

      // Company logo (left side of header)
      let logoLoaded = false;
      const logoPath = path.join(process.cwd(), "static", "logo-transparent.png");
      if (fs.existsSync(logoPath)) {
        try {
          doc.image(logoPath, margin, 10, { height: 65, fit: [180, 65] });
          logoLoaded = true;
        } catch (e) {
          // fall through to text fallback
        }
      }

      if (!logoLoaded) {
        // Text fallback if logo unavailable
        doc.fontSize(22).font("Helvetica-Bold").fillColor(COLORS.white);
        doc.text("TARAN", margin, 20);
        doc.fontSize(10).font("Helvetica").fillColor(COLORS.lightBlue);
        doc.text("INDUSTRIE", margin, 46, { characterSpacing: 4 });
      }

      // "FACTURE" title (right side of header)
      doc.fontSize(26).font("Helvetica-Bold").fillColor(COLORS.white);
      doc.text("FACTURE", 0, 22, { align: "right", width: pageWidth - margin });

      doc.fontSize(11).font("Helvetica").fillColor(COLORS.lightBlue);
      doc.text(invoiceNumber, 0, 54, { align: "right", width: pageWidth - margin });

      // ── COMPANY INFO + ORDER META ──────────────────────────────────
      const infoY = 105;

      // Left: company info block
      const companyName = config.company_name || "Taran Industrie";
      const companyAddress = config.company_address || "35, rue des Pierres Fortes\n85500 LES HERBIERS";
      const companyPhone = config.company_phone || "02 51 92 49 41";
      const companyEmail = config.company_email || "contact@taran-industrie.com";

      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.navyBlue);
      doc.text(companyName, margin, infoY);

      doc.fontSize(9).font("Helvetica").fillColor(COLORS.textMuted);
      doc.text(companyAddress, margin, infoY + 16, { lineGap: 2 });
      const addrLineCount = companyAddress.split("\n").length;
      doc.text(`Tél : ${companyPhone}`, margin, infoY + 16 + addrLineCount * 13);
      doc.text(companyEmail, margin, infoY + 16 + addrLineCount * 13 + 13);

      // Right: order meta box
      const metaBoxX = pageWidth - margin - 190;
      const metaBoxY = infoY - 5;
      doc.rect(metaBoxX, metaBoxY, 190, 80).fill(COLORS.lightGray).stroke(COLORS.borderGray);

      const metaTextX = metaBoxX + 12;
      let metaY = metaBoxY + 10;

      const metaLine = (label: string, value: string) => {
        doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.textMuted);
        doc.text(label, metaTextX, metaY, { continued: false });
        doc.fontSize(9).font("Helvetica").fillColor(COLORS.textDark);
        doc.text(value, metaTextX, metaY + 10);
        metaY += 26;
      };

      metaLine("Date de facture :", formatDate(new Date()));
      metaLine("Date de commande :", formatDate(order.created_at));
      metaLine("N° commande :", `#${order.display_id}`);

      // ── DIVIDER ───────────────────────────────────────────────────
      const dividerY = infoY + 95;
      doc.moveTo(margin, dividerY).lineTo(pageWidth - margin, dividerY)
        .strokeColor(COLORS.borderGray).lineWidth(1).stroke();

      // ── ADDRESSES ─────────────────────────────────────────────────
      const addrY = dividerY + 14;
      const col1X = margin;
      const col2X = pageWidth / 2 + 10;

      const addressBlock = (title: string, lines: string[], x: number, y: number) => {
        // Small blue header accent
        doc.rect(x, y, 3, 12).fill(COLORS.lightBlue);
        doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.navyBlue);
        doc.text(title.toUpperCase(), x + 8, y + 1, { characterSpacing: 0.5 });
        doc.fontSize(9).font("Helvetica").fillColor(COLORS.textDark);
        lines.forEach((line, i) => {
          doc.text(line, x + 8, y + 16 + i * 13);
        });
      };

      addressBlock("Adresse de facturation", formatAddress(order.billing_address), col1X, addrY);
      addressBlock("Adresse de livraison", formatAddress(order.shipping_address), col2X, addrY);

      // ── ITEMS TABLE ────────────────────────────────────────────────
      const tableTop = addrY + 80;
      const colProduct = margin;
      const colQty = margin + 310;
      const colUnit = margin + 370;
      const colTotal = margin + 440;
      const tableWidth = contentWidth;

      // Table header band
      doc.rect(margin, tableTop, tableWidth, 22).fill(COLORS.navyBlue);

      doc.fontSize(9).font("Helvetica-Bold").fillColor(COLORS.white);
      doc.text("PRODUIT", colProduct + 8, tableTop + 7);
      doc.text("QTÉ", colQty, tableTop + 7, { width: 50, align: "center" });
      doc.text("PRIX UNIT. HT", colUnit - 10, tableTop + 7, { width: 80, align: "right" });
      doc.text("TOTAL HT", colTotal, tableTop + 7, { width: 70, align: "right" });

      // Table rows
      let rowY = tableTop + 22;
      doc.font("Helvetica").fontSize(9).fillColor(COLORS.textDark);

      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        // Alternate row background
        if (i % 2 === 0) {
          doc.rect(margin, rowY, tableWidth, 22).fill(COLORS.lightGray);
        }

        doc.fillColor(COLORS.textDark);
        doc.text(item.title, colProduct + 8, rowY + 7, { width: 290, ellipsis: true });
        doc.text(item.quantity.toString(), colQty, rowY + 7, { width: 50, align: "center" });
        doc.text(formatCurrency(item.unit_price, order.currency_code), colUnit - 10, rowY + 7, { width: 80, align: "right" });
        doc.text(formatCurrency(item.total, order.currency_code), colTotal, rowY + 7, { width: 70, align: "right" });
        rowY += 22;
      }

      // Bottom border of table
      doc.rect(margin, rowY, tableWidth, 1).fill(COLORS.mediumBlue);

      // ── SUMMARY ────────────────────────────────────────────────────
      const summaryX = margin + 310;
      const summaryWidth = tableWidth - 310;
      let summaryY = rowY + 14;

      const summaryLine = (label: string, value: string, bold = false) => {
        doc.fontSize(9)
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fillColor(bold ? COLORS.navyBlue : COLORS.textMuted);
        doc.text(label, summaryX, summaryY, { width: summaryWidth / 2 });
        doc.fillColor(bold ? COLORS.navyBlue : COLORS.textDark);
        doc.text(value, summaryX + summaryWidth / 2, summaryY, { width: summaryWidth / 2, align: "right" });
        summaryY += 16;
      };

      summaryLine("Sous-total HT :", formatCurrency(order.subtotal, order.currency_code));
      summaryLine("Taxes :", formatCurrency(order.tax_total, order.currency_code));
      summaryLine("Livraison :", formatCurrency(order.shipping_total, order.currency_code));

      if (order.discount_total > 0) {
        summaryLine("Remise :", `-${formatCurrency(order.discount_total, order.currency_code)}`);
      }

      // Total highlight box
      summaryY += 4;
      doc.rect(summaryX, summaryY, summaryWidth, 26).fill(COLORS.navyBlue);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(COLORS.white);
      doc.text("TOTAL TTC", summaryX + 10, summaryY + 8, { width: summaryWidth / 2 });
      doc.text(
        formatCurrency(order.total, order.currency_code),
        summaryX + summaryWidth / 2,
        summaryY + 8,
        { width: summaryWidth / 2 - 10, align: "right" }
      );

      // ── NOTES ──────────────────────────────────────────────────────
      if (config.notes) {
        const notesY = summaryY + 50;
        doc.rect(margin, notesY, 3, 12).fill(COLORS.lightBlue);
        doc.fontSize(8).font("Helvetica-Bold").fillColor(COLORS.navyBlue);
        doc.text("NOTES", margin + 8, notesY + 1);
        doc.fontSize(9).font("Helvetica-Oblique").fillColor(COLORS.textMuted);
        doc.text(config.notes, margin + 8, notesY + 18, { width: contentWidth - 20 });
      }

      // ── FOOTER BAND ────────────────────────────────────────────────
      const footerY = pageHeight - 40;
      doc.rect(0, footerY, pageWidth, 40).fill(COLORS.navyBlue);
      doc.rect(0, footerY, pageWidth, 3).fill(COLORS.lightBlue);

      doc.fontSize(8).font("Helvetica").fillColor(COLORS.white);
      doc.text(
        "Taran Industrie — 35, rue des Pierres Fortes, 85500 LES HERBIERS — Tél : 02 51 92 49 41 — contact@taran-industrie.com",
        0,
        footerY + 12,
        { align: "center", width: pageWidth }
      );
      doc.fillColor(COLORS.lightBlue);
      doc.text("Définir les besoins, livrer les solutions !", 0, footerY + 24, {
        align: "center",
        width: pageWidth,
      });

      doc.end();
    });

    return new StepResponse(buffer);
  }
);
