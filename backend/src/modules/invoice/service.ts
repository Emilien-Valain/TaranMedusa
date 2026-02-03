import { MedusaService } from "@medusajs/framework/utils";
import { Invoice, InvoiceConfig } from "./models";

class InvoiceModuleService extends MedusaService({
  Invoice,
  InvoiceConfig,
}) {
  async getOrCreateInvoice(orderId: string) {
    const [existingInvoice] = await this.listInvoices({
      order_id: orderId,
      status: "latest",
    });

    if (existingInvoice) {
      return existingInvoice;
    }

    const invoice = await this.createInvoices({
      order_id: orderId,
      status: "latest",
    });

    return invoice;
  }

  async getOrCreateConfig() {
    const [existingConfig] = await this.listInvoiceConfigs({});

    if (existingConfig) {
      return existingConfig;
    }

    const config = await this.createInvoiceConfigs({
      company_name: null,
      company_logo: null,
      company_address: null,
      company_phone: null,
      company_email: null,
      notes: null,
    });

    return config;
  }
}

export default InvoiceModuleService;
