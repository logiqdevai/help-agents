import { APP_NAME } from "@/config/constants/app";
import { environments } from "@/config/environments";
import type { FaqItem } from "@/interfaces/marketing.interfaces";
import { Routes } from "@/routes/routes";

interface PageStructuredDataProps {
  /** Path of the page, e.g. "/ai-voice-agent". */
  path: string;
  title: string;
  description: string;
  /** Last breadcrumb label. */
  name: string;
  /** What the page is about: a service or a software product. */
  entity: { type: "Service" | "SoftwareApplication"; name: string; category: string };
  faqs: readonly FaqItem[];
}

/** WebPage + BreadcrumbList + Service/SoftwareApplication + FAQPage for a public marketing page. */
export function PageStructuredData({ path, title, description, name, entity, faqs }: PageStructuredDataProps) {
  const siteUrl = environments.siteUrl;
  const pageUrl = `${siteUrl}${path}`;

  const entityNode =
    entity.type === "Service"
      ? {
          "@type": "Service",
          "@id": `${pageUrl}#entity`,
          name: entity.name,
          serviceType: entity.category,
          description,
          url: pageUrl,
          provider: { "@type": "Organization", name: APP_NAME, url: siteUrl },
        }
      : {
          "@type": "SoftwareApplication",
          "@id": `${pageUrl}#entity`,
          name: entity.name,
          applicationCategory: entity.category,
          operatingSystem: "Web",
          description,
          url: pageUrl,
          publisher: { "@type": "Organization", name: APP_NAME, url: siteUrl },
        };

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}#webpage`,
        url: pageUrl,
        name: title,
        description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        about: { "@id": `${pageUrl}#entity` },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteUrl}${Routes.home}` },
          { "@type": "ListItem", position: 2, name, item: pageUrl },
        ],
      },
      entityNode,
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
