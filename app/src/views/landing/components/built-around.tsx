import { Container } from "./container";
import { Orb } from "./orb";
import { LandingControls } from "@/config/constants/landing";

/** Static switch glyph; the list is an illustration of what the customer controls, not a live form. */
function SwitchGlyph() {
  return (
    <span aria-hidden className="flex h-5 w-9 shrink-0 items-center justify-end rounded-full bg-primary px-0.5">
      <span className="size-4 rounded-full bg-primary-foreground" />
    </span>
  );
}

export function BuiltAround() {
  return (
    <section aria-labelledby="built-around-title" className="border-t border-hairline">
      <Container className="grid items-center gap-14 py-20 lg:grid-cols-12 lg:gap-16 lg:py-28">
        <div className="lg:col-span-6">
          <h2
            id="built-around-title"
            className="max-w-[18ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-light tracking-[-0.02em] text-ink"
          >
            Not another chatbot. An AI automation layer.
          </h2>
          <div className="mt-6 flex max-w-[50ch] flex-col gap-4 leading-[1.6] tracking-[0.01em] text-body">
            <p>Every business works differently.</p>
            <p>
              That&rsquo;s why the platform is designed around your existing systems, processes and requirements.
            </p>
            <p className="font-medium text-ink">Your AI agents operate within the workflows you define.</p>
          </div>
        </div>

        <div className="relative isolate lg:col-span-6">
          <Orb color="sky" className="top-[55%] left-[62%] size-[460px] -translate-x-1/2 -translate-y-1/2" />
          <div className="mx-auto w-full max-w-[520px] rounded-xl border border-hairline bg-surface-card shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
            <h3 className="border-b border-hairline-soft px-6 py-4 text-[15px] font-medium text-ink">You decide</h3>
            <ul>
              {LandingControls.map((control) => (
                <li
                  key={control}
                  className="flex items-center justify-between gap-6 border-b border-hairline-soft px-6 py-4 last:border-b-0"
                >
                  <span className="text-[15px] text-ink">{control}</span>
                  <SwitchGlyph />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
