import { z } from "zod";

export const AdminCreateShippingProfile = z
  .object({
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    free_shipping_threshold: z.number().nullable().optional(),
    currency_code: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();
export type AdminCreateShippingProfileType = z.infer<
  typeof AdminCreateShippingProfile
>;

export const AdminUpdateShippingProfile = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    free_shipping_threshold: z.number().nullable().optional(),
    currency_code: z.string().optional(),
    is_active: z.boolean().optional(),
  })
  .strict();
export type AdminUpdateShippingProfileType = z.infer<
  typeof AdminUpdateShippingProfile
>;

export const AdminCreateWeightTier = z
  .object({
    min_weight: z.number().min(0),
    max_weight: z.number().min(0),
    price: z.number().min(0),
  })
  .strict();
export type AdminCreateWeightTierType = z.infer<typeof AdminCreateWeightTier>;

export const AdminUpdateWeightTier = z
  .object({
    min_weight: z.number().min(0).optional(),
    max_weight: z.number().min(0).optional(),
    price: z.number().min(0).optional(),
  })
  .strict();
export type AdminUpdateWeightTierType = z.infer<typeof AdminUpdateWeightTier>;
