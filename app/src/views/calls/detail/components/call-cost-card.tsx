import type { FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallCostCategoryFormOptions } from "@/config/constants/dropdowns/calls/call-cost-category-form.options";
import { CallCostUnitFormOptions } from "@/config/constants/dropdowns/calls/call-cost-unit-form.options";
import {
  CostCategories,
  LiveCallStatuses,
  type CallDetail,
  type CostCategory,
} from "@/features/calls/interfaces/calls.interfaces";
import { getDropdownOptionLabel } from "@/lib/dropdown-option-label.utils";
import { formatMoney, formatNumber } from "@/lib/format";

interface CallCostCardProps {
  call: CallDetail;
}

/** AI + telephony + total, priced at the time of the call (spec §23). */
export const CallCostCard: FC<CallCostCardProps> = ({ call }) => {
  const { cost } = call;
  const isLive = LiveCallStatuses.includes(call.status);
  const otherItems = cost.items.filter((item) => item.category === CostCategories.OTHER);
  const otherTotal = otherItems.reduce((sum, item) => sum + item.amount, 0);

  const lines: { category: CostCategory; amount: number }[] = [
    { category: CostCategories.AI, amount: cost.ai },
    { category: CostCategories.TELEPHONY, amount: cost.telephony },
    ...(otherItems.length ? [{ category: CostCategories.OTHER, amount: otherTotal }] : []),
  ];

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-2">
        <CardTitle>Cost</CardTitle>
        <span className="font-medium tabular-nums">
          {isLive ? "—" : formatMoney(cost.total, cost.currency)}
        </span>
      </CardHeader>
      <CardContent>
        {isLive ? (
          <p className="text-sm text-muted-foreground">The cost is calculated when the call ends.</p>
        ) : (
          <>
            <dl className="divide-y divide-border text-sm">
              {lines.map(({ category, amount }) => (
                <div key={category} className="flex items-start justify-between gap-4 py-3 first:pt-0">
                  <dt>
                    <span className="text-muted-foreground">
                      {getDropdownOptionLabel(CallCostCategoryFormOptions, category)}
                    </span>
                    {cost.items
                      .filter((item) => item.category === category)
                      .map((item) => (
                        <span key={`${item.description}-${item.unit}`} className="block text-xs text-muted-foreground">
                          {formatNumber(item.quantity)}{" "}
                          {getDropdownOptionLabel(CallCostUnitFormOptions, item.unit)} ×{" "}
                          {formatMoney(item.unit_price, item.currency)}/
                          {getDropdownOptionLabel(CallCostUnitFormOptions, item.unit)}
                        </span>
                      ))}
                  </dt>
                  <dd className="font-medium tabular-nums">{formatMoney(amount, cost.currency)}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-4 py-3 last:pb-0">
                <dt className="font-medium">Total</dt>
                <dd className="font-medium tabular-nums">{formatMoney(cost.total, cost.currency)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Prices at the time of the call — they never change retroactively when rates change.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
