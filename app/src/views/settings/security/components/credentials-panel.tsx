import type { FC } from "react";
import { LockIcon } from "lucide-react";
import { OrbPanel } from "../../components/orb-panel";

/** How connection secrets are handled (spec §39). */
export const CredentialsPanel: FC = () => (
  <OrbPanel orbs={["lavender", "mint"]} className="p-7">
    <div className="flex items-start gap-3.5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
        <LockIcon className="size-5" aria-hidden />
      </span>
      <div>
        <h3 className="font-heading text-base font-medium">How we protect your connections</h3>
        <p className="mt-1 max-w-xl text-sm">
          CRM keys, tokens and other credentials are stored encrypted. After you save one, the full value is never
          shown again, only a masked hint such as{" "}
          <span className="rounded bg-background/70 px-1 font-mono text-xs">••••abcd</span>. Secrets stay on our
          servers and never reach your browser. Every action in your account is checked against your role, and each
          company’s data is kept completely separate.
        </p>
      </div>
    </div>
  </OrbPanel>
);
