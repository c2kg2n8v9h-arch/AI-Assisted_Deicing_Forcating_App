import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { writeSanitizedJson } from '@automation-platform/observability';
import { redactSensitiveData } from '@automation-platform/security';
import { addAttachment } from '@wdio/allure-reporter';
import { browser } from '@wdio/globals';

import { currentRunPaths } from './run-context.js';

function safeFileName(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

export async function captureFailureEvidence(
  testTitle: string,
  errorMessage?: string,
): Promise<void> {
  const timestamp = new Date().toISOString();
  const safeTitle = safeFileName(testTitle) || 'failed-test';
  const diagnostic = redactSensitiveData({
    error: errorMessage,
    testTitle,
    timestamp,
    url: await browser.getUrl(),
  });
  const diagnosticJson = JSON.stringify(diagnostic, null, 2);
  await addAttachment('Sanitized failure diagnostics', diagnosticJson, 'application/json');
  await writeSanitizedJson(
    path.join(currentRunPaths.diagnostics, `${timestamp.replace(/[:.]/g, '-')}-${safeTitle}.json`),
    diagnostic,
  );

  await mkdir(currentRunPaths.screenshots, { recursive: true });
  await browser.saveScreenshot(
    path.join(currentRunPaths.screenshots, `${timestamp.replace(/[:.]/g, '-')}-${safeTitle}.png`),
  );
}
