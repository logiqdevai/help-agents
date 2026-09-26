import { CustomerSupportIndustry } from "./customer-support";
import type { IndustryContent, IndustrySlug } from "./industry.types";
import { ProfessionalServicesIndustry } from "./professional-services";
import { RealEstateIndustry } from "./real-estate";
import { RecruitmentIndustry } from "./recruitment";
import { SalesIndustry } from "./sales";

export * from "./industry.types";

export const Industries: IndustryContent[] = [
  RealEstateIndustry,
  SalesIndustry,
  CustomerSupportIndustry,
  ProfessionalServicesIndustry,
  RecruitmentIndustry,
];

export function getIndustry(slug: string): IndustryContent | undefined {
  return Industries.find((industry) => industry.slug === (slug as IndustrySlug));
}
