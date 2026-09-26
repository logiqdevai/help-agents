import { APP_NAME } from "@/config/constants/app";
import { LandingFaqs, LandingSeo } from "@/config/constants/landing";
import { environments } from "@/config/environments";

const siteUrl = environments.siteUrl;

const StructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: APP_NAME,
      url: siteUrl,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: APP_NAME,
      description: LandingSeo.description,
      publisher: { "@id": `${siteUrl}/#organization` },
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: `${APP_NAME} AI automation platform`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: LandingSeo.description,
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${siteUrl}/#webpage`,
      url: siteUrl,
      name: LandingSeo.title,
      description: LandingSeo.description,
      isPartOf: { "@id": `${siteUrl}/#website` },
      about: { "@id": `${siteUrl}/#software` },
      inLanguage: "en",
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: LandingFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export function LandingStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(StructuredData).replace(/</g, "\\u003c") }}
    />
  );
}
