import { Container } from "@/components/marketing/container";

export function SupportingStatement() {
  return (
    <section aria-label="Overview" className="border-t border-hairline">
      <Container className="grid gap-10 py-20 lg:grid-cols-12 lg:py-28">
        <p className="font-display text-[clamp(1.75rem,3.6vw,2.75rem)] leading-[1.17] font-light tracking-[-0.01em] text-ink lg:col-span-9">
          Your business already has the data, leads, customers and workflows. Our AI agents turn that information
          into action.
        </p>
        <p className="max-w-[46ch] leading-[1.6] tracking-[0.01em] text-body lg:col-span-5 lg:col-start-8">
          From making phone calls and following up with leads to processing emails and answering customer questions,
          automate the work that normally requires your team to do it manually.
        </p>
      </Container>
    </section>
  );
}
