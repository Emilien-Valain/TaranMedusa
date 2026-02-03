import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework";
import { INVOICE_MODULE } from "../../../modules/invoice";
import InvoiceModuleService from "../../../modules/invoice/service";
import { AdminUpdateInvoiceConfigType } from "./validators";

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const invoiceService = req.scope.resolve<InvoiceModuleService>(INVOICE_MODULE);

  const config = await invoiceService.getOrCreateConfig();

  res.json({ invoice_config: config });
};

export const POST = async (
  req: AuthenticatedMedusaRequest<AdminUpdateInvoiceConfigType>,
  res: MedusaResponse
) => {
  const invoiceService = req.scope.resolve<InvoiceModuleService>(INVOICE_MODULE);

  const existingConfig = await invoiceService.getOrCreateConfig();

  const updatedConfig = await invoiceService.updateInvoiceConfigs({
    id: existingConfig.id,
    ...req.body,
  });

  res.json({ invoice_config: updatedConfig });
};
