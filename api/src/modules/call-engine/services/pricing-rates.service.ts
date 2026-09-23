import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { paginated, skipTake } from '@/shared/utils/pagination/pagination';
import { CreatePricingRateDto } from '../dto/create-pricing-rate.dto';
import { UpdatePricingRateDto } from '../dto/update-pricing-rate.dto';
import { PricingRateQueryType } from '../dto/pricing-rate-query.schema';

@Injectable()
export class PricingRatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PricingRateQueryType) {
    const now = new Date();
    const where: Prisma.PricingRateWhereInput = {
      ...(query.key && { key: query.key }),
      ...(query.company_uuid && { company_uuid: query.company_uuid }),
      ...(query.active === true && {
        effective_from: { lte: now },
        OR: [{ effective_to: null }, { effective_to: { gt: now } }],
      }),
      ...(query.active === false && {
        OR: [{ effective_from: { gt: now } }, { effective_to: { lte: now } }],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.pricingRate.findMany({
        where,
        ...skipTake({ page: query.page, limit: query.limit }),
        orderBy: [{ key: 'asc' }, { effective_from: 'desc' }],
      }),
      this.prisma.pricingRate.count({ where }),
    ]);
    return paginated(items, total, query.page, query.limit);
  }

  async create(dto: CreatePricingRateDto) {
    const from = dto.effective_from ? new Date(dto.effective_from) : new Date();
    const to = dto.effective_to ? new Date(dto.effective_to) : null;
    if (to && to <= from) throw new BadRequestException('effective_to must be after effective_from');

    if (dto.company_uuid) {
      const company = await this.prisma.company.findUnique({ where: { id: dto.company_uuid } });
      if (!company) throw new NotFoundException('Company not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const open = await tx.pricingRate.findFirst({
        where: {
          key: dto.key,
          company_uuid: dto.company_uuid ?? null,
          provider: dto.provider ?? null,
          effective_to: null,
        },
        orderBy: { effective_from: 'desc' },
      });

      if (open) {
        if (open.effective_from >= from) {
          throw new BadRequestException('The new rate must start after the currently active rate');
        }
        await tx.pricingRate.update({ where: { id: open.id }, data: { effective_to: from } });
      }

      return tx.pricingRate.create({
        data: {
          key: dto.key,
          category: dto.category,
          unit: dto.unit,
          unit_price: new Prisma.Decimal(dto.unit_price),
          currency: (dto.currency ?? 'EUR').toUpperCase(),
          provider: dto.provider ?? null,
          company_uuid: dto.company_uuid ?? null,
          effective_from: from,
          effective_to: to,
        },
      });
    });
  }

  async update(id: string, dto: UpdatePricingRateDto) {
    const rate = await this.prisma.pricingRate.findUnique({ where: { id } });
    if (!rate) throw new NotFoundException('Pricing rate not found');
    if (!dto.effective_to) throw new BadRequestException('effective_to is required');

    const to = new Date(dto.effective_to);
    if (to <= rate.effective_from) throw new BadRequestException('effective_to must be after effective_from');

    return this.prisma.pricingRate.update({ where: { id }, data: { effective_to: to } });
  }

  /** Rates currently effective for a company: its own overrides win over platform defaults. */
  async findEffectiveForCompany(companyUuid: string) {
    const now = new Date();
    const rates = await this.prisma.pricingRate.findMany({
      where: {
        effective_from: { lte: now },
        AND: [
          { OR: [{ effective_to: null }, { effective_to: { gt: now } }] },
          { OR: [{ company_uuid: companyUuid }, { company_uuid: null }] },
        ],
      },
      orderBy: { effective_from: 'desc' },
    });

    const byKey = new Map<string, (typeof rates)[number]>();
    for (const rate of rates) {
      const existing = byKey.get(rate.key);
      if (!existing || (existing.company_uuid === null && rate.company_uuid !== null)) {
        byKey.set(rate.key, rate);
      }
    }

    return [...byKey.values()].map((r) => ({
      key: r.key,
      category: r.category,
      unit: r.unit,
      unit_price: r.unit_price,
      currency: r.currency,
      effective_from: r.effective_from,
      source: r.company_uuid ? 'company' : 'platform',
    }));
  }
}
