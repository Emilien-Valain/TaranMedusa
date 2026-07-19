import { z } from "zod";

export const AdminUpdateColissimoConfig = z
  .object({
    enabled: z.boolean().optional(),
    api_key: z.string().optional().nullable(),
    contract_number: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
    // Effacement explicite d'un secret : un champ vide « conserve », ces
    // drapeaux permettent de vraiment supprimer l'apiKey / le mot de passe.
    clear_api_key: z.boolean().optional(),
    clear_password: z.boolean().optional(),
    label_format: z.string().optional().nullable(),
    sender_name: z.string().optional().nullable(),
    sender_street: z.string().optional().nullable(),
    sender_street2: z.string().optional().nullable(),
    sender_zip: z.string().optional().nullable(),
    sender_city: z.string().optional().nullable(),
    sender_country: z.string().optional().nullable(),
    sender_phone: z.string().optional().nullable(),
    sender_email: z.string().optional().nullable(),
  })
  .strict();

export type AdminUpdateColissimoConfigType = z.infer<
  typeof AdminUpdateColissimoConfig
>;
