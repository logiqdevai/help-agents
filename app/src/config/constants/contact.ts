import type { MarketingTextItem } from "@/interfaces/marketing.interfaces";

export const ContactSeo = {
  title: "Book a demo or contact us",
  description:
    "Tell us which AI agents you’re interested in and how you work today. Book a demo or ask a question about the voice agent, email agent or Viber chatbot.",
} as const;

export const ContactSteps: MarketingTextItem[] = [
  { title: "Send the form", body: "Tell us who you are and which agents you’d like to hear about." },
  { title: "We reply by email", body: "We’ll ask a few questions or suggest a time for a demo." },
  {
    title: "See how it would work for you",
    body: "We’ll walk through your workflow and tell you honestly whether it’s a fit.",
  },
];
