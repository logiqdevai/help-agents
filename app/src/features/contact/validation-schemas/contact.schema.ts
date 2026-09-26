import { z } from "zod";
import { ProductSlugs } from "@/config/constants/products";
import { ContactRequestTypes } from "@/features/contact/interfaces/contact.interfaces";

export const contactSchema = z.object({
  request_type: z.enum([ContactRequestTypes.demo, ContactRequestTypes.question]),
  name: z.string().trim().min(1, "Name is required").max(120, "Use at most 120 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address").max(254),
  phone: z.string().trim().max(32, "Use at most 32 characters").optional(),
  products: z
    .array(z.enum([ProductSlugs.voice, ProductSlugs.email, ProductSlugs.messaging]))
    .min(1, "Choose at least one agent"),
  message: z.string().trim().max(3000, "Use at most 3000 characters").optional(),
  website: z.string().max(200).optional(),
});
export type ContactFormData = z.infer<typeof contactSchema>;
