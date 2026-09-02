import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { latestRunPaths } from './report-utils.js';

const sensitiveKeyPattern = /(?:api[-_]?key|authorization|cookie|password|passwd|secret|token)/i;
const configuredValues = Object.entries(process.env)
  .filter(([key, value]) => sensitiveKeyPattern.test(key) && value)
  .map(([, value]) => value as string);
const explicitValues = (process.env.SENSITIVE_SCAN_VALUES ?? '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const forbiddenValues = [...new Set([...configuredValues, ...explicitValues])].filter(
  (value) => value.length >= 4,
);

if (forbiddenValues.length === 0) {
  throw new Error(
    'Artifact verification requires at least one sensitive environment value or SENSITIVE_SCAN_VALUES entry.',
  );
}

const paths = latestRunPaths();
const files = await listFiles(paths.executionRoot);
const findings: string[] = [];

for (const file of files) {
  const content = await readFile(file);
  if (forbiddenValues.some((value) => content.includes(Buffer.from(value)))) {
    findings.push(path.relative(paths.executionRoot, file));
  }
}

if (findings.length > 0) {
  throw new Error(`Sensitive values were found in generated artifacts:\n${findings.join('\n')}`);
}

process.stdout.write(
  `Artifact security scan passed: ${String(files.length)} files checked against ${String(forbiddenValues.length)} forbidden values.\n`,
);

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
    }),
  );
  return nested.flat();
}
