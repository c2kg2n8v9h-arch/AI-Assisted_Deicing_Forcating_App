import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

import type { ExecutionMetadata, ExecutionSummary } from '@automation-platform/contracts';
import { redactSensitiveData } from '@automation-platform/security';

export interface CreateExecutionMetadataOptions {
  readonly browser: string;
  readonly environment: ExecutionMetadata['environment'];
  readonly profile: string;
  readonly projectId: string;
  readonly runId?: string | undefined;
  readonly startedAt?: string | undefined;
  readonly suite: ExecutionMetadata['suite'];
}

export function createExecutionMetadata(
  options: CreateExecutionMetadataOptions,
): ExecutionMetadata {
  return Object.freeze({
    browser: options.browser,
    environment: options.environment,
    profile: options.profile,
    projectId: options.projectId,
    runId: options.runId ?? randomUUID(),
    startedAt: options.startedAt ?? new Date().toISOString(),
    suite: options.suite,
  });
}

export async function writeExecutionMetadata(
  executionDirectory: string,
  metadata: ExecutionMetadata,
): Promise<void> {
  await writeSanitizedJson(path.join(executionDirectory, 'metadata.json'), metadata);
}

export async function writeExecutionSummary(
  executionDirectory: string,
  metadata: ExecutionMetadata,
  exitCode: number,
): Promise<ExecutionSummary> {
  const finishedAt = new Date();
  const summary: ExecutionSummary = {
    ...metadata,
    durationMs: Math.max(0, finishedAt.getTime() - new Date(metadata.startedAt).getTime()),
    exitCode,
    finishedAt: finishedAt.toISOString(),
    status: exitCode === 0 ? 'passed' : 'failed',
  };
  await writeSanitizedJson(path.join(executionDirectory, 'summary.json'), summary);
  return summary;
}

export async function writeLatestRunPointer(executionsRoot: string, runId: string): Promise<void> {
  await mkdir(executionsRoot, { recursive: true });
  await writeFile(path.join(executionsRoot, 'latest-run.txt'), `${runId}\n`, 'utf8');
}

export async function writeSanitizedJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const safeValue = redactSensitiveData(value);
  await writeFile(filePath, `${JSON.stringify(safeValue, null, 2)}\n`, 'utf8');
}
