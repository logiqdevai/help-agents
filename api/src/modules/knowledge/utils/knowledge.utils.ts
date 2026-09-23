import { BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';
import { extname } from 'path';
import * as mammoth from 'mammoth';
import WordExtractor = require('word-extractor');

export const MAX_KNOWLEDGE_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_KNOWLEDGE_CONTENT_CHARS = 500_000;

const ALLOWED_EXTENSIONS = ['.txt', '.md', '.doc', '.docx'] as const;

const ALLOWED_MIMETYPES = new Set([
  'text/plain',
  'text/markdown',
  'text/x-markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
  '',
]);

export function contentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

export function normalizeContent(raw: string): string {
  return raw.replace(/\r\n/g, '\n').replace(/\u0000/g, '').trim();
}

export function validateKnowledgeFile(file: Express.Multer.File | undefined): asserts file is Express.Multer.File {
  if (!file) throw new BadRequestException('A file is required');
  const ext = extname(file.originalname || '').toLowerCase();
  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    throw new BadRequestException(`Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`);
  }
  if (!ALLOWED_MIMETYPES.has((file.mimetype || '').toLowerCase())) {
    throw new BadRequestException('The file content type does not match a supported document type');
  }
  if (file.size > MAX_KNOWLEDGE_FILE_BYTES) {
    throw new BadRequestException('File is too large (10 MB maximum)');
  }
}

/** Extracts plain text from an uploaded .txt / .md / .doc / .docx file. */
export async function extractText(file: Express.Multer.File): Promise<string> {
  const ext = extname(file.originalname).toLowerCase();
  let text: string;

  try {
    if (ext === '.docx') {
      text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
    } else if (ext === '.doc') {
      const doc = await new WordExtractor().extract(file.buffer);
      text = doc.getBody();
    } else {
      text = file.buffer.toString('utf8');
    }
  } catch {
    throw new BadRequestException('The document could not be read. Make sure the file is not corrupted or password protected.');
  }

  const normalized = normalizeContent(text);
  if (!normalized) throw new BadRequestException('The document does not contain any text');
  if (normalized.length > MAX_KNOWLEDGE_CONTENT_CHARS) {
    throw new BadRequestException('The document is too long');
  }
  return normalized;
}
