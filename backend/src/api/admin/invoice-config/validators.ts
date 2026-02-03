import { z } from "zod";

export type AdminUpdateInvoiceConfigType = z.infer<
  typeof AdminUpdateInvoiceConfig
>;
export const AdminUpdateInvoiceConfig = z
  .object({
    company_name: z.string().optional().nullable(),
    company_logo: z.string().optional().nullable(),
    company_address: z.string().optional().nullable(),
    company_phone: z.string().optional().nullable(),
    company_email: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })
  .strict();
