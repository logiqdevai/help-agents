import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  DocumentType,
  IntegrationCategory,
  KnowledgeSourceType,
  KnowledgeStatus,
  Prisma,
} from 'generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import type { CompanyContextData } from '@/shared/decorators/company.decorator';
import { ActivityLogService } from '@/shared/services/activity-log/activity-log.service';
import { paginated } from '@/shared/utils/pagination/pagination';
import { GcsService } from '@/integrations/storage/gcs/services/gcs.service';
import { ConnectKnowledgeDto } from './dto/connect-knowledge.dto';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { CreateKnowledgeVersionDto } from './dto/create-knowledge-version.dto';
import { KnowledgeQueryType } from './dto/knowledge-query.schema';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { UploadKnowledgeDto } from './dto/upload-knowledge.dto';
import { INTERNAL_SOURCE_TYPES, KnowledgeConnectorRegistry } from './connectors/knowledge-connector.registry';
import {
  KnowledgeSourceDetailResponse,
  KnowledgeSourceResponse,
  KnowledgeVersionDetail,
  KnowledgeVersionSummary,
} from './interfaces/knowledge.interface';
import { KnowledgeProcessingService } from './services/knowledge-processing.service';
import {
  SOURCE_INCLUDE,
  SourceRow,
  toSourceResponse,
  toVersionDetail,
  toVersionSummary,
  VERSION_INCLUDE,
} from './utils/knowledge.mapper';
import {
  contentHash,
  extractText,
  normalizeContent,
  validateKnowledgeFile,
  MAX_KNOWLEDGE_CONTENT_CHARS,
} from './utils/knowledge.utils';

interface NewVersionInput {
  content: string;
  document_uuid?: string | null;
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly processing: KnowledgeProcessingService,
    private readonly connectors: KnowledgeConnectorRegistry,
    private readonly gcs: GcsService,
    private readonly activity: ActivityLogService,
  ) {}

  // ------------------------------------------------------------------ read

  async findAll(ctx: CompanyContextData, query: KnowledgeQueryType) {
    const where: Prisma.KnowledgeSourceWhereInput = {
      company_uuid: ctx.company_uuid,
      deleted_at: null,
      ...(query.status && { status: query.status }),
      ...(query.type && { type: query.type }),
      ...(query.is_enabled !== undefined && { is_enabled: query.is_enabled }),
      ...(query.search && { name: { contains: query.search, mode: 'insensitive' } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.knowledgeSource.findMany({
        where,
        include: SOURCE_INCLUDE,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.order_by]: query.order_direction },
      }),
      this.prisma.knowledgeSource.count({ where }),
    ]);

    return paginated(items.map(toSourceResponse), total, query.page, query.limit);
  }

  async findOne(ctx: CompanyContextData, id: string): Promise<KnowledgeSourceDetailResponse> {
    const source = await this.getSource(ctx.company_uuid, id);
    return this.toDetail(source);
  }

  async listVersions(ctx: CompanyContextData, id: string): Promise<KnowledgeVersionSummary[]> {
    const source = await this.getSource(ctx.company_uuid, id);
    const versions = await this.prisma.knowledgeSourceVersion.findMany({
      where: { source_uuid: source.id },
      include: VERSION_INCLUDE,
      orderBy: { version: 'desc' },
    });
    return versions.map((v) => toVersionSummary(v, source.current_version));
  }

  async getVersion(ctx: CompanyContextData, id: string, version: number): Promise<KnowledgeVersionDetail> {
    const source = await this.getSource(ctx.company_uuid, id);
    const row = await this.prisma.knowledgeSourceVersion.findUnique({
      where: { source_uuid_version: { source_uuid: source.id, version } },
      include: VERSION_INCLUDE,
    });
    if (!row) throw new NotFoundException('Version not found');
    return toVersionDetail(row, source.current_version);
  }

  // ----------------------------------------------------------------- write

  async create(ctx: CompanyContextData, dto: CreateKnowledgeDto): Promise<KnowledgeSourceDetailResponse> {
    const content = this.requireContent(dto.content);
    const source = await this.createSource(ctx, {
      name: dto.name.trim(),
      type: KnowledgeSourceType.TEXT,
      content,
    });
    await this.activity.logFor(ctx, 'knowledge.created', 'knowledge_source', source.id, { name: source.name });
    return this.toDetail(source);
  }

  async upload(
    ctx: CompanyContextData,
    file: Express.Multer.File | undefined,
    dto: UploadKnowledgeDto,
  ): Promise<KnowledgeSourceDetailResponse> {
    validateKnowledgeFile(file);
    const content = await extractText(file);
    const documentUuid = await this.storeDocument(ctx, file);

    const source = await this.createSource(ctx, {
      name: (dto.name?.trim() || file.originalname).slice(0, 200),
      type: KnowledgeSourceType.FILE,
      content,
      document_uuid: documentUuid,
    });
    await this.activity.logFor(ctx, 'knowledge.uploaded', 'knowledge_source', source.id, {
      name: source.name,
      filename: file.originalname,
    });
    return this.toDetail(source);
  }

  async connect(ctx: CompanyContextData, dto: ConnectKnowledgeDto): Promise<KnowledgeSourceDetailResponse> {
    if (INTERNAL_SOURCE_TYPES.includes(dto.type)) {
      throw new BadRequestException('Use the text or upload endpoints for typed and uploaded knowledge');
    }
    const connector = this.connectors.get(dto.type);

    const integration = await this.prisma.integration.findFirst({
      where: { id: dto.integration_uuid, company_uuid: ctx.company_uuid },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    if (integration.category !== IntegrationCategory.KNOWLEDGE && integration.category !== IntegrationCategory.STORAGE) {
      throw new BadRequestException('This integration cannot be used as a knowledge source');
    }

    const fetched = await connector.fetchContent(
      { id: '', company_uuid: ctx.company_uuid, external_ref: dto.external_ref, type: dto.type },
      integration,
    );
    const source = await this.createSource(ctx, {
      name: dto.name.trim(),
      type: dto.type,
      content: this.requireContent(fetched.content),
      integration_uuid: integration.id,
      external_ref: fetched.external_ref ?? dto.external_ref,
    });
    await this.activity.logFor(ctx, 'knowledge.connected', 'knowledge_source', source.id, {
      name: source.name,
      type: dto.type,
    });
    return this.toDetail(source);
  }

  async update(ctx: CompanyContextData, id: string, dto: UpdateKnowledgeDto): Promise<KnowledgeSourceDetailResponse> {
    const source = await this.getSource(ctx.company_uuid, id);

    const updated = await this.prisma.knowledgeSource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.is_enabled !== undefined && { is_enabled: dto.is_enabled }),
      },
      include: SOURCE_INCLUDE,
    });

    const toggled = dto.is_enabled !== undefined && dto.is_enabled !== source.is_enabled;
    if (toggled) {
      setImmediate(async () => {
        try {
          await this.processing.resyncAgents(await this.processing.attachedAgentIds(id));
        } catch (error) {
          this.logger.error(`Re-sync after toggling ${id} failed: ${error?.message}`);
        }
      });
    }

    await this.activity.logFor(
      ctx,
      toggled ? (dto.is_enabled ? 'knowledge.enabled' : 'knowledge.disabled') : 'knowledge.updated',
      'knowledge_source',
      id,
      { name: updated.name },
    );
    return this.toDetail(updated);
  }

  async createVersion(
    ctx: CompanyContextData,
    id: string,
    dto: CreateKnowledgeVersionDto,
    file?: Express.Multer.File,
  ): Promise<KnowledgeSourceDetailResponse> {
    const source = await this.getSource(ctx.company_uuid, id);
    this.assertEditable(source);

    let input: NewVersionInput;
    if (file) {
      validateKnowledgeFile(file);
      input = { content: await extractText(file), document_uuid: await this.storeDocument(ctx, file) };
    } else if (dto.content !== undefined) {
      input = { content: this.requireContent(dto.content) };
    } else {
      throw new BadRequestException('Provide either content or a file');
    }

    const { created } = await this.addVersion(ctx, source, input);
    if (created) {
      await this.activity.logFor(ctx, 'knowledge.version_created', 'knowledge_source', id, { name: source.name });
    }
    return this.findOne(ctx, id);
  }

  async restoreVersion(ctx: CompanyContextData, id: string, version: number): Promise<KnowledgeSourceDetailResponse> {
    const source = await this.getSource(ctx.company_uuid, id);
    this.assertEditable(source);

    const old = await this.prisma.knowledgeSourceVersion.findUnique({
      where: { source_uuid_version: { source_uuid: source.id, version } },
    });
    if (!old) throw new NotFoundException('Version not found');

    const { created } = await this.addVersion(ctx, source, {
      content: old.content,
      document_uuid: old.document_uuid,
    });
    if (created) {
      await this.activity.logFor(ctx, 'knowledge.version_restored', 'knowledge_source', id, {
        restored_version: version,
      });
    }
    return this.findOne(ctx, id);
  }

  async refresh(ctx: CompanyContextData, id: string): Promise<KnowledgeSourceDetailResponse> {
    const source = await this.getSource(ctx.company_uuid, id);

    if (!INTERNAL_SOURCE_TYPES.includes(source.type)) {
      const connector = this.connectors.get(source.type);
      const integration = source.integration_uuid
        ? await this.prisma.integration.findFirst({ where: { id: source.integration_uuid, company_uuid: ctx.company_uuid } })
        : null;
      if (!integration) throw new BadRequestException('The integration for this source is no longer connected');
      const fetched = await connector.fetchContent(source, integration);
      const { created } = await this.addVersion(ctx, source, { content: this.requireContent(fetched.content) });
      if (created) return this.findOne(ctx, id);
    }

    const current = await this.prisma.knowledgeSourceVersion.findUnique({
      where: { source_uuid_version: { source_uuid: source.id, version: source.current_version } },
    });
    if (!current) throw new NotFoundException('Version not found');

    await this.prisma.$transaction([
      this.prisma.knowledgeSourceVersion.update({
        where: { id: current.id },
        data: { status: KnowledgeStatus.PROCESSING, error: null },
      }),
      this.prisma.knowledgeSource.update({
        where: { id },
        data: { status: KnowledgeStatus.PROCESSING, last_error: null },
      }),
    ]);
    this.processing.enqueue(current.id);

    await this.activity.logFor(ctx, 'knowledge.refreshed', 'knowledge_source', id, { name: source.name });
    return this.findOne(ctx, id);
  }

  async remove(ctx: CompanyContextData, id: string): Promise<{ message: string }> {
    const source = await this.getSource(ctx.company_uuid, id);
    const agentIds = await this.processing.attachedAgentIds(id);

    await this.prisma.$transaction([
      this.prisma.agentKnowledgeSource.deleteMany({ where: { source_uuid: id } }),
      this.prisma.knowledgeSource.update({
        where: { id },
        data: { deleted_at: new Date(), is_enabled: false },
      }),
    ]);

    setImmediate(async () => {
      try {
        const synced = await this.processing.resyncAgents(agentIds);
        if (synced) await this.processing.deleteSupersededKnowledgeBases(id);
      } catch (error) {
        this.logger.error(`Cleanup after deleting ${id} failed: ${error?.message}`);
      }
    });

    await this.activity.logFor(ctx, 'knowledge.deleted', 'knowledge_source', id, { name: source.name });
    return { message: 'Knowledge source deleted' };
  }

  // --------------------------------------------------------------- helpers

  private async createSource(
    ctx: CompanyContextData,
    input: {
      name: string;
      type: KnowledgeSourceType;
      content: string;
      document_uuid?: string | null;
      integration_uuid?: string | null;
      external_ref?: string | null;
    },
  ): Promise<SourceRow> {
    const created = await this.prisma.$transaction(async (tx) => {
      const source = await tx.knowledgeSource.create({
        data: {
          company_uuid: ctx.company_uuid,
          added_by_uuid: ctx.user_uuid,
          integration_uuid: input.integration_uuid ?? null,
          external_ref: input.external_ref ?? null,
          name: input.name,
          type: input.type,
          status: KnowledgeStatus.PROCESSING,
          current_version: 1,
        },
      });
      const version = await tx.knowledgeSourceVersion.create({
        data: {
          source_uuid: source.id,
          version: 1,
          created_by_uuid: ctx.user_uuid,
          document_uuid: input.document_uuid ?? null,
          content: input.content,
          content_hash: contentHash(input.content),
          status: KnowledgeStatus.PROCESSING,
        },
      });
      return { source, version };
    });

    this.processing.enqueue(created.version.id);
    return this.getSource(ctx.company_uuid, created.source.id);
  }

  /** Adds an immutable version unless the content is unchanged from the current healthy one. */
  private async addVersion(
    ctx: CompanyContextData,
    source: SourceRow,
    input: NewVersionInput,
  ): Promise<{ created: boolean }> {
    const hash = contentHash(input.content);
    const current = await this.prisma.knowledgeSourceVersion.findUnique({
      where: { source_uuid_version: { source_uuid: source.id, version: source.current_version } },
    });
    if (current && current.content_hash === hash && current.status !== KnowledgeStatus.FAILED) {
      return { created: false };
    }

    const latest = await this.prisma.knowledgeSourceVersion.aggregate({
      where: { source_uuid: source.id },
      _max: { version: true },
    });
    const next = (latest._max.version ?? 0) + 1;

    try {
      const version = await this.prisma.$transaction(async (tx) => {
        const created = await tx.knowledgeSourceVersion.create({
          data: {
            source_uuid: source.id,
            version: next,
            created_by_uuid: ctx.user_uuid,
            document_uuid: input.document_uuid ?? null,
            content: input.content,
            content_hash: hash,
            status: KnowledgeStatus.PROCESSING,
          },
        });
        await tx.knowledgeSource.update({
          where: { id: source.id },
          data: { current_version: next, status: KnowledgeStatus.PROCESSING, last_error: null },
        });
        return created;
      });
      this.processing.enqueue(version.id);
      return { created: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('The knowledge source was changed at the same time. Please try again.');
      }
      throw error;
    }
  }

  private async storeDocument(ctx: CompanyContextData, file: Express.Multer.File): Promise<string | null> {
    try {
      const safeName = file.originalname.replace(/[^\w.\-]+/g, '_');
      const uploaded = await this.gcs.uploadImageFromBuffer(
        file.buffer,
        `${randomUUID()}-${safeName}`,
        file.mimetype || 'application/octet-stream',
        `knowledge/${ctx.company_uuid}`,
      );
      const document = await this.prisma.document.create({
        data: {
          user_uuid: ctx.user_uuid,
          company_uuid: ctx.company_uuid,
          filename: file.originalname,
          mimetype: file.mimetype || 'application/octet-stream',
          size: file.size,
          url: uploaded.url,
          path: uploaded.path,
          type: DocumentType.KNOWLEDGE,
        },
      });
      return document.id;
    } catch (error) {
      this.logger.warn(`Original file was not stored (continuing with extracted text): ${error?.message}`);
      return null;
    }
  }

  private requireContent(raw: string): string {
    const content = normalizeContent(raw ?? '');
    if (!content) throw new BadRequestException('Content cannot be empty');
    if (content.length > MAX_KNOWLEDGE_CONTENT_CHARS) throw new BadRequestException('Content is too long');
    return content;
  }

  private assertEditable(source: SourceRow): void {
    if (!INTERNAL_SOURCE_TYPES.includes(source.type)) {
      throw new BadRequestException('This source is synced from an external system. Use refresh instead.');
    }
  }

  private async getSource(companyUuid: string, id: string): Promise<SourceRow> {
    const source = await this.prisma.knowledgeSource.findFirst({
      where: { id, company_uuid: companyUuid, deleted_at: null },
      include: SOURCE_INCLUDE,
    });
    if (!source) throw new NotFoundException('Knowledge source not found');
    return source;
  }

  private async toDetail(source: SourceRow): Promise<KnowledgeSourceDetailResponse> {
    const versions = await this.prisma.knowledgeSourceVersion.findMany({
      where: { source_uuid: source.id },
      include: VERSION_INCLUDE,
      orderBy: { version: 'desc' },
    });
    const current = versions.find((v) => v.version === source.current_version);
    const base: KnowledgeSourceResponse = toSourceResponse(source);
    return {
      ...base,
      content: current?.content ?? null,
      versions: versions.map((v) => toVersionSummary(v, source.current_version)),
    };
  }
}
