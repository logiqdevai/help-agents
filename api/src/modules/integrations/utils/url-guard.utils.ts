import { BadRequestException } from '@nestjs/common';
import { lookup } from 'dns/promises';
import { isIP } from 'net';

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

export function isPrivateAddress(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateIPv4(mapped[1]);
    return false;
  }
  return true;
}

const BLOCKED_SUFFIXES = ['.local', '.internal', '.localhost', '.lan', '.home', '.corp'];

/** Syntax-level SSRF checks (scheme, credentials, obviously internal hosts). */
export function assertSafeUrlSyntax(raw: string, allowHttp: boolean): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BadRequestException('Invalid URL');
  }

  if (url.protocol !== 'https:' && !(allowHttp && url.protocol === 'http:')) {
    throw new BadRequestException('URL must use https');
  }
  if (url.username || url.password) {
    throw new BadRequestException('URL must not contain credentials');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (host === 'localhost' || BLOCKED_SUFFIXES.some((s) => host.endsWith(s))) {
    throw new BadRequestException('URL host is not allowed');
  }
  if (isIP(host) && isPrivateAddress(host)) {
    throw new BadRequestException('URL host is not allowed');
  }
  return url;
}

/** Syntax checks plus a DNS resolution check so public names can't point at internal addresses. */
export async function assertSafeUrl(raw: string, allowHttp: boolean): Promise<URL> {
  const url = assertSafeUrlSyntax(raw, allowHttp);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host)) return url;

  try {
    const addresses = await lookup(host, { all: true });
    if (!addresses.length || addresses.some((a) => isPrivateAddress(a.address))) {
      throw new BadRequestException('URL host is not allowed');
    }
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException('URL host could not be resolved');
  }
  return url;
}
