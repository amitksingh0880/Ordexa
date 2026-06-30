import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(8).optional(),
});

export const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1),
  phone: z.string().min(5),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const cartMergeSchema = z.object({
  cartId: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
