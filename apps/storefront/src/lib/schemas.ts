import { z } from "zod";

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
export type NewsletterValues = z.infer<typeof newsletterSchema>;

export const checkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
});
export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "At least 8 characters"),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const addressSchema = z.object({
  label: z.string().optional(),
  fullName: z.string().min(1, "Name is required"),
  phone: z.string().min(5, "Enter a valid phone"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
});
export type AddressValues = z.infer<typeof addressSchema>;

export const reviewSchema = z.object({
  author: z.string().min(1, "Name is required"),
  rating: z.number().int().min(1).max(5),
  body: z.string().min(4, "Tell us a little more"),
});
export type ReviewValues = z.infer<typeof reviewSchema>;

export const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
  subject: z.string().optional(),
  body: z.string().min(4, "Message is too short"),
});
export type ContactValues = z.infer<typeof contactSchema>;
