import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION = 'v1';

/**
 * Symmetric encryption for secrets stored in the database (integration
 * credentials, ...). Format: `v1:<iv b64>:<tag b64>:<ciphertext b64>`.
 */
@Injectable()
export class CryptoService {
  private key: Buffer | null = null;

  constructor(private readonly config: ConfigService) {}

  private getKey(): Buffer {
    if (this.key) return this.key;

    const raw = this.config.get<string>('ENCRYPTION_KEY');
    if (!raw) {
      throw new ServiceUnavailableException('ENCRYPTION_KEY is not configured');
    }

    if (/^[0-9a-fA-F]{64}$/.test(raw)) {
      this.key = Buffer.from(raw, 'hex');
    } else {
      const decoded = Buffer.from(raw, 'base64');
      this.key = decoded.length === 32 ? decoded : createHash('sha256').update(raw).digest();
    }
    return this.key;
  }

  encrypt(plain: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, this.getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [VERSION, iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':');
  }

  decrypt(payload: string): string {
    const [version, iv, tag, data] = payload.split(':');
    if (version !== VERSION || !iv || !tag || !data) {
      throw new InternalServerErrorException('Invalid encrypted payload');
    }
    try {
      const decipher = createDecipheriv(ALGORITHM, this.getKey(), Buffer.from(iv, 'base64'));
      decipher.setAuthTag(Buffer.from(tag, 'base64'));
      return Buffer.concat([
        decipher.update(Buffer.from(data, 'base64')),
        decipher.final(),
      ]).toString('utf8');
    } catch {
      throw new InternalServerErrorException('Failed to decrypt stored secret');
    }
  }

  encryptJson(value: unknown): string {
    return this.encrypt(JSON.stringify(value));
  }

  decryptJson<T = Record<string, any>>(payload: string): T {
    return JSON.parse(this.decrypt(payload)) as T;
  }

  /** "sk_live_abcdef" -> "••••cdef". Never reveals more than the last 4 characters. */
  mask(secret: string | null | undefined): string | null {
    if (!secret) return null;
    return `••••${secret.slice(-4)}`;
  }
}
