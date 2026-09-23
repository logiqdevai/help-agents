import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CostCategory, CostUnit, PricingRate, Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';

const RATE_KEYS: Array<{ key: string; category: CostCategory; label: string }> = [
  { key: 'ai.minute', category: CostCategory.AI, label: 'AI voice agent' },
  { key: 'telephony.minute', category: CostCategory.TELEPHONY, label: 'Phone / telephony' },
];

const TELEPHONY_PRODUCT_RE = /(telephony|twilio|telnyx|sip|phone|carrier|trunk)/i;

type CostItemInput = Prisma.CallCostItemCreateManyInput;

/** Versioned call pricing (spec §23). Rates live in PricingRate; past calls keep their snapshot. */
@Injectable()
export class PricingService {
  private readonly logger = new Logger(PricingService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculates the cost of a finished call and snapshots it as CallCostItem rows.
   * Idempotent: existing items are replaced. Never throws for missing pricing data.
   */
  async applyCosts(callUuid: string): Promise<void> {
    const call = await this.prisma.call.findUnique({ where: { id: callUuid } });
    if (!call) throw new NotFoundException('Call not found');

    const seconds = call.duration_seconds ?? 0;
    const at = call.started_at ?? call.created_at;

    let items: CostItemInput[] = [];

    if (seconds > 0) {
      const rates = await Promise.all(
        RATE_KEYS.map((r) => this.findRate(call.company_uuid, r.key, call.provider, at)),
      );
      const providerCost = this.readProviderCost(call.provider_cost);

      if (rates.every(Boolean) || (rates.some(Boolean) && !providerCost)) {
        items = RATE_KEYS.flatMap((def, i) =>
          rates[i] ? [this.itemFromRate(call.id, def, rates[i], seconds)] : [],
        );
      } else if (providerCost) {
        items = this.itemsFromProviderCost(call.id, providerCost);
      }
    }

    const sum = (category: CostCategory) =>
      items
        .filter((i) => i.category === category)
        .reduce((acc, i) => acc.plus(i.amount as Prisma.Decimal), new Prisma.Decimal(0));

    const ai = sum(CostCategory.AI).toDecimalPlaces(6);
    const telephony = sum(CostCategory.TELEPHONY).toDecimalPlaces(6);
    const other = sum(CostCategory.OTHER).toDecimalPlaces(6);

    await this.prisma.$transaction([
      this.prisma.callCostItem.deleteMany({ where: { call_uuid: call.id } }),
      ...(items.length ? [this.prisma.callCostItem.createMany({ data: items })] : []),
      this.prisma.call.update({
        where: { id: call.id },
        data: {
          ai_cost: ai,
          telephony_cost: telephony,
          total_cost: ai.plus(telephony).plus(other).toDecimalPlaces(6),
          currency: (items[0]?.currency as string) ?? call.currency,
        },
      }),
    ]);
  }

  /** Company-specific rate beats the platform rate; rate must be effective at `at`; newest wins. */
  async findRate(
    companyUuid: string,
    key: string,
    provider: PricingRate['provider'],
    at: Date,
  ): Promise<PricingRate | null> {
    const candidates = await this.prisma.pricingRate.findMany({
      where: {
        key,
        effective_from: { lte: at },
        AND: [
          { OR: [{ effective_to: null }, { effective_to: { gt: at } }] },
          { OR: [{ company_uuid: companyUuid }, { company_uuid: null }] },
          { OR: [{ provider: null }, { provider }] },
        ],
      },
      orderBy: { effective_from: 'desc' },
    });

    return (
      candidates.find((c) => c.company_uuid === companyUuid) ??
      candidates.find((c) => c.company_uuid === null) ??
      null
    );
  }

  private itemFromRate(
    callUuid: string,
    def: { category: CostCategory; label: string },
    rate: PricingRate,
    seconds: number,
  ): CostItemInput {
    const exactQuantity = this.quantityFor(rate.unit, seconds);
    const amount = exactQuantity.mul(rate.unit_price).toDecimalPlaces(6);

    return {
      call_uuid: callUuid,
      pricing_rate_uuid: rate.id,
      category: def.category,
      description: def.label,
      quantity: exactQuantity.toDecimalPlaces(4),
      unit: rate.unit,
      unit_price: rate.unit_price,
      amount,
      currency: rate.currency,
    };
  }

  private quantityFor(unit: CostUnit, seconds: number): Prisma.Decimal {
    switch (unit) {
      case CostUnit.MINUTE:
        return new Prisma.Decimal(seconds).div(60);
      case CostUnit.SECOND:
        return new Prisma.Decimal(seconds);
      default:
        return new Prisma.Decimal(1);
    }
  }

  /** Retell reports `combined_cost` and per-product costs in cents (USD). */
  private readProviderCost(raw: Prisma.JsonValue | null): Array<{ product: string; usd: number }> | null {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const obj = ((raw as any).call_cost ?? raw) as Record<string, any>;

    const products = Array.isArray(obj.product_costs) ? obj.product_costs : [];
    const parsed = products
      .filter((p: any) => typeof p?.cost === 'number' && p.cost > 0)
      .map((p: any) => ({ product: String(p.product ?? 'usage'), usd: p.cost / 100 }));
    if (parsed.length) return parsed;

    if (typeof obj.combined_cost === 'number' && obj.combined_cost > 0) {
      return [{ product: 'usage', usd: obj.combined_cost / 100 }];
    }
    return null;
  }

  private itemsFromProviderCost(
    callUuid: string,
    products: Array<{ product: string; usd: number }>,
  ): CostItemInput[] {
    const grouped = new Map<CostCategory, number>();
    for (const p of products) {
      const category = TELEPHONY_PRODUCT_RE.test(p.product) ? CostCategory.TELEPHONY : CostCategory.AI;
      grouped.set(category, (grouped.get(category) ?? 0) + p.usd);
    }

    return [...grouped.entries()].map(([category, usd]) => {
      const amount = new Prisma.Decimal(usd).toDecimalPlaces(6);
      return {
        call_uuid: callUuid,
        pricing_rate_uuid: null,
        category,
        description: category === CostCategory.TELEPHONY ? 'Phone / telephony' : 'AI voice agent',
        quantity: new Prisma.Decimal(1),
        unit: CostUnit.CALL,
        unit_price: amount.toDecimalPlaces(8),
        amount,
        currency: 'USD',
      };
    });
  }
}
