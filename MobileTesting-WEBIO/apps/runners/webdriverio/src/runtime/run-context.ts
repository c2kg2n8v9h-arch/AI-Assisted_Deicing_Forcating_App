import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  createExecutionMetadata,
  writeExecutionMetadata,
  writeExecutionSummary,
  writeLatestRunPointer,
} from '@automation-platform/observability';

import { runnerEnvironment } from './environment.js';
import { executionPaths, runnerPaths } from './paths.js';

export const executionMetadata = createExecutionMetadata({
  browser: runnerEnvironment.BROWSER,
  environment: runnerEnvironment.TARGET_ENV,
  profile: runnerEnvironment.RUN_MODE,
  projectId: runnerEnvironment.PROJECT_ID ?? 'unconfigured',
  runId: process.env.AUTOMATION_RUN_ID,
  startedAt: process.env.AUTOMATION_RUN_STARTED_AT,
  suite: runnerEnvironment.SUITE,
});

process.env.AUTOMATION_RUN_ID = executionMetadata.runId;
process.env.AUTOMATION_RUN_STARTED_AT = executionMetadata.startedAt;

export const currentRunPaths = executionPaths(executionMetadata.runId);

export async function prepareExecutionArtifacts(): Promise<void> {
  await Promise.all(
    [
      currentRunPaths.allureResults,
      currentRunPaths.browserLogs,
      currentRunPaths.diagnostics,
      currentRunPaths.frameworkLogs,
      currentRunPaths.screenshots,
      runnerPaths.driverCache,
    ].map(async (directory) => mkdir(directory, { recursive: true })),
  );
  await writeExecutionMetadata(currentRunPaths.frameworkLogs, executionMetadata);
  await writeLatestRunPointer(runnerPaths.executionsRoot, executionMetadata.runId);
  await writeAllureLaunchMetadata();
}

export async function completeExecutionArtifacts(exitCode: number): Promise<void> {
  await writeExecutionSummary(currentRunPaths.frameworkLogs, executionMetadata, exitCode);
}

async function writeAllureLaunchMetadata(): Promise<void> {
  const environmentProperties = [
    `Browser=${safeProperty(executionMetadata.browser)}`,
    `Environment=${safeProperty(executionMetadata.environment)}`,
    `Profile=${safeProperty(executionMetadata.profile)}`,
    `Project=${safeProperty(executionMetadata.projectId)}`,
    `RunId=${safeProperty(executionMetadata.runId)}`,
    `Suite=${safeProperty(executionMetadata.suite)}`,
  ].join('\n');
  await writeFile(
    path.join(currentRunPaths.allureResults, 'environment.properties'),
    `${environmentProperties}\n`,
    'utf8',
  );
  await writeFile(
    path.join(currentRunPaths.allureResults, 'executor.json'),
    `${JSON.stringify(
      {
        name: 'Automation Intelligence Platform',
        type: process.env.CI ? 'ci' : 'local',
        buildName: executionMetadata.runId,
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
}

function safeProperty(value: string): string {
  return value.replace(/[\r\n=]/g, '_');
}
