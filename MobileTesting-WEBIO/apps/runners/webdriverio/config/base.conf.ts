import path from 'node:path';

import { sanitizeBrowserArtifacts } from '../src/runtime/browser-artifacts.js';
import { createBrowserCapability } from '../src/runtime/capabilities.js';
import { runnerEnvironment } from '../src/runtime/environment.js';
import { captureFailureEvidence } from '../src/runtime/evidence.js';
import { runnerPaths } from '../src/runtime/paths.js';
import {
  completeExecutionArtifacts,
  currentRunPaths,
  prepareExecutionArtifacts,
} from '../src/runtime/run-context.js';

export interface RunnerProfile {
  readonly headless: boolean;
  readonly maxInstances: number;
  readonly specFileRetries: number;
}

export function createBaseConfig(profile: RunnerProfile): WebdriverIO.Config {
  const defaultSpecGlob = path.join(runnerPaths.projectsRoot, '**', '*.spec.ts');
  const specGlob = runnerEnvironment.SPEC_GLOB
    ? path.resolve(runnerPaths.workspaceRoot, runnerEnvironment.SPEC_GLOB)
    : defaultSpecGlob;

  return {
    runner: 'local',
    specs: [specGlob],
    exclude: [],
    maxInstances: profile.maxInstances,
    capabilities: [createBrowserCapability(runnerEnvironment, profile.headless)],
    logLevel: runnerEnvironment.LOG_LEVEL,
    outputDir: currentRunPaths.browserLogs,
    bail: 0,
    baseUrl: runnerEnvironment.BASE_URL,
    waitforTimeout: 10_000,
    connectionRetryTimeout: 120_000,
    connectionRetryCount: 2,
    specFileRetries: profile.specFileRetries,
    framework: 'mocha',
    reporters: [
      ['spec', { addConsoleLogs: true }],
      [
        'allure',
        {
          outputDir: currentRunPaths.allureResults,
          disableWebdriverStepsReporting: true,
          disableWebdriverScreenshotsReporting: false,
        },
      ],
    ],
    mochaOpts: {
      ui: 'bdd',
      timeout: 60_000,
      ...(runnerEnvironment.SUITE_GREP ? { grep: new RegExp(runnerEnvironment.SUITE_GREP) } : {}),
    },
    onPrepare: async () => prepareExecutionArtifacts(),
    afterTest: async (test, _context, result) => {
      if (!result.passed) {
        const testError: unknown = result.error;
        const errorMessage = testError instanceof Error ? testError.message : undefined;
        await captureFailureEvidence(test.title, errorMessage);
      }
    },
    onComplete: async (exitCode) => {
      await sanitizeBrowserArtifacts(currentRunPaths.browserLogs);
      await completeExecutionArtifacts(exitCode);
    },
  };
}
