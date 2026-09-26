import { Container } from "@/components/marketing/container";
import { LandingIntegrations } from "@/config/constants/landing";

export function Integrations() {
  return (
    <section id="integrations" aria-labelledby="integrations-title" className="scroll-mt-16 border-t border-hairline">
      <Container className="py-20 lg:py-28">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-16">
          <h2
            id="integrations-title"
            className="font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink lg:col-span-6"
          >
            Works with the tools you already use
          </h2>
          <div className="flex max-w-[50ch] flex-col gap-4 leading-[1.6] tracking-[0.01em] text-body lg:col-span-5 lg:col-start-8">
            <p>Your AI agents don&rsquo;t need to operate in isolation.</p>
            <p>Connect them to the systems that contain your business data and run your workflows.</p>
          </div>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
          {LandingIntegrations.map((integration) => (
            <li key={integration.title} className="bg-canvas p-7 lg:p-8">
              <span className="flex size-8 items-center justify-center rounded-full bg-surface-strong">
                <integration.icon className="size-4 text-ink" aria-hidden />
              </span>
              <h3 className="mt-5 text-xl leading-[1.35] font-medium text-ink">{integration.title}</h3>
              <p className="mt-2 max-w-[36ch] text-[15px] leading-[1.55] tracking-[0.01em] text-body">
                {integration.body}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
