import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguageFormOptions } from "@/config/constants/dropdowns/shared/language.options";
import type { CallDetail } from "@/features/calls/interfaces/calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";

interface CallContextCardsProps {
  call: CallDetail;
}

/** Personalization and the agent snapshot: what the agent knew when it dialed. */
export const CallContextCards: FC<CallContextCardsProps> = ({ call }) => (
  <>
    {call.personalization.length > 0 ? (
      <Card>
        <CardHeader>
          <CardTitle>Personalization</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Details pulled from the CRM and given to the agent before dialing.
          </p>
          <dl className="grid grid-cols-[minmax(90px,140px)_1fr] gap-x-4 gap-y-2 text-sm">
            {call.personalization.map((item) => (
              <div key={item.key} className="contents">
                <dt className="text-muted-foreground">{item.label}</dt>
                <dd className="min-w-0 break-words">{item.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    ) : null}

    <Card>
      <CardHeader>
        <CardTitle>What the agent had</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          A snapshot of the agent and its knowledge at the time of this call.
        </p>
        <dl className="divide-y divide-border text-sm">
          {call.agent_language ? (
            <div className="flex justify-between gap-4 py-2.5 first:pt-0">
              <dt className="text-muted-foreground">Language</dt>
              <dd className="font-medium">{getDropdownOptionLabel(LanguageFormOptions, call.agent_language)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
            <dt className="text-muted-foreground">Attempt</dt>
            <dd className="font-medium">{call.attempt_number}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Knowledge used</p>
          {call.knowledge_used.length === 0 ? (
            <p className="text-sm text-muted-foreground">No knowledge sources were attached.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {call.knowledge_used.map((source) => (
                <li key={source.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate font-medium">{source.name}</span>
                  {source.version !== null ? <Badge variant="secondary">v{source.version}</Badge> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  </>
);
