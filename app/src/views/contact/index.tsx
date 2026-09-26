import type { FC } from "react";
import { Container } from "@/components/marketing/container";
import { Orb } from "@/components/marketing/orb";
import { CONTACT_EMAIL } from "@/config/constants/app";
import { ContactSteps } from "@/config/constants/contact";
import { ContactForm } from "./components/contact-form";

const ContactPage: FC = () => (
  <section aria-labelledby="contact-title" className="relative isolate overflow-hidden">
    <Orb color="mint" drift className="-top-32 -right-24 size-[520px]" />
    <Orb color="peach" drift className="-bottom-40 -left-32 size-[440px]" />

    <Container className="grid gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:gap-12 lg:pt-24 lg:pb-28">
      <div className="lg:col-span-5">
        <h1
          id="contact-title"
          className="max-w-[14ch] font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.05] font-light tracking-[-0.03em] text-ink"
        >
          Book a demo or ask us anything
        </h1>
        <p className="mt-6 max-w-[46ch] text-lg leading-[1.55] tracking-[0.01em] text-body">
          Tell us which agents you’re interested in and how you handle leads and customer messages today. We’ll get back
          to you by email.
        </p>
        <ol className="mt-10 flex flex-col gap-6">
          {ContactSteps.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full border border-hairline-strong text-sm text-ink"
              >
                {index + 1}
              </span>
              <div>
                <h2 className="text-[15px] font-medium text-ink">{step.title}</h2>
                <p className="mt-1 max-w-[40ch] text-[15px] leading-[1.5] text-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-[15px] text-body">
          Prefer email?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-ink underline underline-offset-4">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
      <div className="lg:col-span-7">
        <ContactForm />
      </div>
    </Container>
  </section>
);

export default ContactPage;
