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
