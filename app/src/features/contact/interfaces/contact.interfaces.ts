import type { ProductSlug } from "@/config/constants/products";

export const ContactRequestTypes = {
  demo: "demo",
  question: "question",
} as const;
export type ContactRequestType = (typeof ContactRequestTypes)[keyof typeof ContactRequestTypes];

export interface CreateContactRequestDto {
  request_type: ContactRequestType;
  name: string;
  email: string;
  phone?: string;
  products: ProductSlug[];
  message?: string;
  /** Honeypot: real visitors leave it empty. */
  website?: string;
}
