import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CompanyAuth,
  CompanyContext,
  CompanyContextData,
  RequirePermissions,
} from '@/shared/decorators/company.decorator';
import { Permissions } from '@/shared/permissions/permissions';
import { ZodValidationPipe } from '@/shared/pipes/zod.validation.pipe';
import { KnowledgeService } from './knowledge.service';
import { ConnectKnowledgeDto } from './dto/connect-knowledge.dto';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { CreateKnowledgeVersionDto } from './dto/create-knowledge-version.dto';
import { KnowledgeQuerySchema, KnowledgeQueryType } from './dto/knowledge-query.schema';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { UploadKnowledgeDto } from './dto/upload-knowledge.dto';
import {
  KnowledgeSource,
  KnowledgeSourceDetail,
  KnowledgeVersionDetailEntity,
  KnowledgeVersionSummaryEntity,
} from './entities/knowledge.entity';
import { MAX_KNOWLEDGE_FILE_BYTES } from './utils/knowledge.utils';

const fileInterceptor = () => FileInterceptor('file', { limits: { fileSize: MAX_KNOWLEDGE_FILE_BYTES } });

@ApiTags('Knowledge')
@Controller('knowledge')
@CompanyAuth()
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get()
  @RequirePermissions(Permissions.KNOWLEDGE_READ)
  @ApiOperation({ summary: 'List knowledge sources' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'is_enabled', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: 200, description: 'Paginated knowledge sources', type: [KnowledgeSource] })
  findAll(
    @CompanyContext() ctx: CompanyContextData,
    @Query(new ZodValidationPipe(KnowledgeQuerySchema)) query: KnowledgeQueryType,
  ) {
    return this.knowledge.findAll(ctx, query);
  }

  @Post()
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Add knowledge by typing text' })
  @ApiResponse({ status: 201, type: KnowledgeSourceDetail })
  create(@CompanyContext() ctx: CompanyContextData, @Body() dto: CreateKnowledgeDto) {
    return this.knowledge.create(ctx, dto);
  }

  @Post('upload')
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @UseInterceptors(fileInterceptor())
  @ApiOperation({ summary: 'Add knowledge by uploading a .txt, .md, .doc or .docx file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadKnowledgeDto })
  @ApiResponse({ status: 201, type: KnowledgeSourceDetail })
  upload(
    @CompanyContext() ctx: CompanyContextData,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadKnowledgeDto,
  ) {
    return this.knowledge.upload(ctx, file, dto);
  }

  @Post('connect')
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Add knowledge from a connected app (not available yet)' })
  @ApiResponse({ status: 501, description: 'Source type not supported yet' })
  connect(@CompanyContext() ctx: CompanyContextData, @Body() dto: ConnectKnowledgeDto) {
    return this.knowledge.connect(ctx, dto);
  }

  @Get(':id')
  @RequirePermissions(Permissions.KNOWLEDGE_READ)
  @ApiOperation({ summary: 'Get a knowledge source with its version history' })
  @ApiResponse({ status: 200, type: KnowledgeSourceDetail })
  findOne(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.knowledge.findOne(ctx, id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Rename a source or turn it on/off without deleting it' })
  @ApiResponse({ status: 200, type: KnowledgeSourceDetail })
  update(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateKnowledgeDto,
  ) {
    return this.knowledge.update(ctx, id, dto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Delete a knowledge source' })
  @ApiResponse({ status: 200, description: 'Knowledge source deleted' })
  remove(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.knowledge.remove(ctx, id);
  }

  @Post(':id/refresh')
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Refresh how the AI uses the current version' })
  @ApiResponse({ status: 201, type: KnowledgeSourceDetail })
  refresh(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.knowledge.refresh(ctx, id);
  }

  @Get(':id/versions')
  @RequirePermissions(Permissions.KNOWLEDGE_READ)
  @ApiOperation({ summary: 'List the version history of a source' })
  @ApiResponse({ status: 200, type: [KnowledgeVersionSummaryEntity] })
  listVersions(@CompanyContext() ctx: CompanyContextData, @Param('id', ParseUUIDPipe) id: string) {
    return this.knowledge.listVersions(ctx, id);
  }

  @Post(':id/versions')
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @UseInterceptors(fileInterceptor())
  @ApiOperation({ summary: 'Add a new version from text (JSON) or a file (multipart)' })
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({ type: CreateKnowledgeVersionDto })
  @ApiResponse({ status: 201, type: KnowledgeSourceDetail })
  createVersion(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateKnowledgeVersionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.knowledge.createVersion(ctx, id, dto, file);
  }

  @Get(':id/versions/:version')
  @RequirePermissions(Permissions.KNOWLEDGE_READ)
  @ApiOperation({ summary: 'View an older version' })
  @ApiResponse({ status: 200, type: KnowledgeVersionDetailEntity })
  getVersion(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.knowledge.getVersion(ctx, id, version);
  }

  @Post(':id/versions/:version/restore')
  @RequirePermissions(Permissions.KNOWLEDGE_WRITE)
  @ApiOperation({ summary: 'Restore an older version (creates a new version with its content)' })
  @ApiResponse({ status: 201, type: KnowledgeSourceDetail })
  restoreVersion(
    @CompanyContext() ctx: CompanyContextData,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('version', ParseIntPipe) version: number,
  ) {
    return this.knowledge.restoreVersion(ctx, id, version);
  }
}
