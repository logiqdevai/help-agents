import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GatheredInformation } from "@/features/calls/interfaces/calls.interfaces";
import { formatGatheredValue } from "@/views/calls/utils/call-format";

interface GatheredInformationCardProps {
  items: GatheredInformation[];
}

export const GatheredInformationCard: FC<GatheredInformationCardProps> = ({ items }) => (
  <Card>
    <CardHeader className="flex items-center justify-between gap-2">
      <CardTitle>Information gathered</CardTitle>
      <span className="text-sm text-muted-foreground">From this agent&apos;s goal items</span>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">The agent did not collect any information on this call.</p>
      ) : (
        <dl className="grid gap-x-8 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex justify-between gap-4 border-b border-border/60 py-3 text-sm last:border-b-0 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0"
            >
              <dt className="text-muted-foreground">{item.label}</dt>
              <dd className="text-right">{formatGatheredValue(item.value)}</dd>
            </div>
          ))}
        </dl>
      )}
    </CardContent>
  </Card>
);
