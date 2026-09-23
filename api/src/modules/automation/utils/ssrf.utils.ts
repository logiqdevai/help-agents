import { promises as dns } from 'dns';
import { isIP } from 'net';

const BLOCKED_HOST_SUFFIXES = ['.local', '.internal', '.localhost', '.lan', '.home', '.corp'];

export function isPrivateIp(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) {
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
  if (family === 6) {
    const lower = ip.toLowerCase();
    if (lower === '::' || lower === '::1') return true;
    if (lower.startsWith('::ffff:')) return isPrivateIp(lower.slice(7));
    return lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe8') ||
      lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb') || lower.startsWith('ff');
  }
  return true;
}

/** Static check usable at rule-definition time: https only, no obviously internal host. */
export function validatePublicHttpsUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return 'Invalid URL';
  }
  if (url.protocol !== 'https:') return 'Only https URLs are allowed';
  if (url.username || url.password) return 'Credentials in the URL are not allowed';

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || BLOCKED_HOST_SUFFIXES.some((s) => host.endsWith(s))) {
    return 'Internal hosts are not allowed';
  }
  if (isIP(host) && isPrivateIp(host)) return 'Private addresses are not allowed';
  if (!host.includes('.') && !isIP(host)) return 'Internal hosts are not allowed';
  return null;
}

/** Execution-time check: also resolves DNS so a public name cannot point at a private address. */
export async function assertPublicUrl(raw: string): Promise<URL> {
  const problem = validatePublicHttpsUrl(raw);
  if (problem) throw new Error(`Webhook URL rejected: ${problem}`);

  const url = new URL(raw);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (isIP(host)) return url;

  const addresses = await dns.lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => isPrivateIp(a.address))) {
    throw new Error('Webhook URL rejected: resolves to a private address');
  }
  return url;
}
