export function getPath(obj: any, path: string | undefined | null): any {
  if (!path) return undefined;
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

const PLACEHOLDER = /\{(\w+(?:\.\w+)*)\}/g;
const WHOLE_PLACEHOLDER = /^\{(\w+(?:\.\w+)*)\}$/;

function stringify(value: unknown): string {
  if (value == null) return '';
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

/**
 * Renders `{var}` placeholders. A string that is exactly one placeholder keeps the raw value type;
 * keys whose value resolves to undefined/empty-string-from-missing are dropped from objects.
 */
export function renderTemplate(template: any, vars: Record<string, any>): any {
  if (typeof template === 'string') {
    const whole = template.match(WHOLE_PLACEHOLDER);
    if (whole) return getPath(vars, whole[1]);
    return template.replace(PLACEHOLDER, (_, p) => stringify(getPath(vars, p)));
  }
  if (Array.isArray(template)) {
    return template.map((item) => renderTemplate(item, vars)).filter((v) => v !== undefined);
  }
  if (template && typeof template === 'object') {
    const out: Record<string, any> = {};
    for (const [key, value] of Object.entries(template)) {
      const rendered = renderTemplate(value, vars);
      if (rendered !== undefined && rendered !== '') out[key] = rendered;
    }
    return out;
  }
  return template;
}

/** Renders a URL path template, URL-encoding every substituted value. */
export function renderPath(path: string, vars: Record<string, any>): string {
  return path.replace(PLACEHOLDER, (_, p) => encodeURIComponent(stringify(getPath(vars, p))));
}

export function toStringValue(value: unknown): string {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(toStringValue).filter(Boolean).join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
