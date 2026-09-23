const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}/g;
const FORBIDDEN_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype']);

export type TemplateContext = Record<string, unknown>;

function resolvePath(context: TemplateContext, path: string): unknown {
  let current: unknown = context;
  for (const segment of path.split('.')) {
    if (FORBIDDEN_SEGMENTS.has(segment)) return undefined;
    if (current === null || typeof current !== 'object') return undefined;
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Replaces `{{path.to.value}}` with values from `context`; unknown paths become empty strings. */
export function renderTemplate(template: string, context: TemplateContext): string {
  return template.replace(PLACEHOLDER_RE, (_, path: string) => stringify(resolvePath(context, path)));
}

/** Renders every string inside a JSON-like structure. */
export function renderDeep<T>(value: T, context: TemplateContext): T {
  if (typeof value === 'string') return renderTemplate(value, context) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => renderDeep(v, context)) as unknown as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, renderDeep(v, context)]),
    ) as unknown as T;
  }
  return value;
}

export function readPath(context: TemplateContext, path: string): unknown {
  return resolvePath(context, path);
}
