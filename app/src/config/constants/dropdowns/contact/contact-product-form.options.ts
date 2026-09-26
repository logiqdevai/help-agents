import { Products, type ProductSlug } from "@/config/constants/products";

export const ContactProductFormOptions: { id: ProductSlug; label: string; description: string }[] = Products.map(
  (product) => ({ id: product.slug, label: product.name, description: product.tagline }),
);
