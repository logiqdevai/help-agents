import { Container } from "./container";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItem } from "@/interfaces/marketing.interfaces";

interface FaqSectionProps {
  faqs: readonly FaqItem[];
  title?: string;
}

export function FaqSection({ faqs, title = "Frequently asked questions" }: FaqSectionProps) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-16 border-t border-hairline">
      <Container className="grid gap-12 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <h2
          id="faq-title"
          className="max-w-[12ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink lg:sticky lg:top-28 lg:col-span-5 lg:self-start"
        >
          {title}
        </h2>
        <Accordion defaultValue={[faqs[0].question]} className="lg:col-span-7">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="border-hairline">
              <AccordionTrigger className="items-center gap-6 rounded-lg py-5 text-lg font-medium text-ink hover:no-underline [&_[data-slot=accordion-trigger-icon]]:size-5">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent
                keepMounted
                className="max-w-[58ch] pb-6 text-base leading-[1.6] tracking-[0.01em] text-body"
              >
                <p>{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </section>
  );
}
