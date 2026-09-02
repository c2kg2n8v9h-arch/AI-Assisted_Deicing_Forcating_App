import { readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { redactSensitiveText } from '@automation-platform/security';

const sensitiveKeyPattern = /(?:api[-_]?key|authorization|cookie|password|passwd|secret|token)/i;

export async function sanitizeBrowserArtifacts(directory: string): Promise<void> {
  const forbiddenValues = collectSensitiveValues();
  await sanitizeDirectory(directory, forbiddenValues);
}

function collectSensitiveValues(): string[] {
  const secretEnvironmentValues = Object.entries(process.env)
    .filter(([key, value]) => sensitiveKeyPattern.test(key) && value)
    .map(([, value]) => value as string);
  const explicitValues = (process.env.SENSITIVE_SCAN_VALUES ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return [...new Set([...secretEnvironmentValues, ...explicitValues])].filter(
    (value) => value.length >= 4,
  );
}

async function sanitizeDirectory(directory: string, forbiddenValues: string[]): Promise<void> {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await rm(entryPath, { force: true, recursive: true });
        return;
      }

      if (path.extname(entry.name).toLowerCase() !== '.log') {
        await rm(entryPath, { force: true });
        return;
      }

      const original = await readFile(entryPath, 'utf8');
      const sanitized = forbiddenValues.reduce(
        (content, value) => content.replaceAll(value, '[REDACTED]'),
        redactSensitiveText(original),
      );
      await writeFile(entryPath, sanitized, 'utf8');
    }),
  );
}
