const REDACTED = '[REDACTED]';
const sensitiveKeyPattern = /(?:api[-_]?key|authorization|cookie|password|passwd|secret|token)/i;
const bearerTokenPattern = /\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi;
const assignmentPattern =
  /\b(api[-_]?key|authorization|cookie|password|passwd|secret|token)\b\s*[:=]\s*([^\s,;]+)/gi;

export function redactSensitiveText(value: string): string {
  return value
    .replace(bearerTokenPattern, `Bearer ${REDACTED}`)
    .replace(assignmentPattern, (_match, key: string) => `${key}=${REDACTED}`);
}

export function redactSensitiveData(value: unknown): unknown {
  return redactValue(value, new WeakSet<object>());
}

function redactValue(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === 'string') {
    return redactSensitiveText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, seen));
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (seen.has(value)) {
    return '[CIRCULAR]';
  }
  seen.add(value);

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      sensitiveKeyPattern.test(key) ? REDACTED : redactValue(item, seen),
    ]),
  );
}
