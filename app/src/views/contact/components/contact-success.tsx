import type { FC } from "react";
import { CheckIcon } from "lucide-react";
import { CtaLink } from "@/components/marketing/cta-link";
import { Routes } from "@/routes/routes";

export const ContactSuccess: FC<{ email: string }> = ({ email }) => (
  <div role="status" className="rounded-2xl border border-hairline bg-canvas p-8 sm:p-10">
    <span className="flex size-12 items-center justify-center rounded-full bg-gradient-mint/60">
      <CheckIcon className="size-5" aria-hidden />
    </span>
    <h2 className="mt-6 font-display text-[2rem] leading-[1.15] font-light tracking-[-0.02em] text-ink">
      Thanks, we got your request
    </h2>
    <p className="mt-3 max-w-[46ch] leading-[1.6] tracking-[0.01em] text-body">
      We’ll reply to <b className="font-medium text-ink">{email}</b> with a time for your demo or an answer to your
      question.
    </p>
    <CtaLink variant="outline" href={Routes.home} className="mt-8">
      Back to the homepage
    </CtaLink>
  </div>
);
