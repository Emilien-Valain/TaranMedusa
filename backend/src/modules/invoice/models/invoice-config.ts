import { model } from "@medusajs/framework/utils";

export const InvoiceConfig = model.define("invoice_config", {
  id: model
    .id({
      prefix: "invconf",
    })
    .primaryKey(),
  company_name: model.text().nullable(),
  company_logo: model.text().nullable(),
  company_address: model.text().nullable(),
  company_phone: model.text().nullable(),
  company_email: model.text().nullable(),
  notes: model.text().nullable(),
});
