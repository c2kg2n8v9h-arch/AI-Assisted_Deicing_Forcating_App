import { loadProjectConfig } from '@automation-platform/configuration';
import { config as loadDotEnv } from 'dotenv';
import { z } from 'zod';

import { runnerPaths } from './paths.js';

loadDotEnv({ path: runnerPaths.envFile, quiet: true });

const optionalText = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().min(1).optional(),
);

const environmentSchema = z.object({
  ALLOW_PRODUCTION: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  BASE_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().optional()),
  BROWSER: z.enum(['chrome', 'edge']).default('chrome'),
  CHROME_BINARY: optionalText,
  CHROMEDRIVER_PATH: optionalText,
  EDGEDRIVER_PATH: optionalText,
  EDGE_BINARY: optionalText,
  HEADLESS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'silent']).default('info'),
  MAX_INSTANCES: z.coerce.number().int().positive().max(20).default(1),
  PROJECT_CONFIG: optionalText,
  RUN_MODE: z.enum(['local', 'headless', 'ci']).default('local'),
  SPEC_GLOB: optionalText,
  SUITE: z.enum(['all', 'smoke', 'regression']).default('all'),
  TARGET_ENV: z.enum(['local', 'qa', 'staging', 'production']).optional(),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  throw new Error(`Invalid runner environment:\n${z.prettifyError(parsedEnvironment.error)}`);
}

const rawEnvironment = parsedEnvironment.data;
const projectConfig = rawEnvironment.PROJECT_CONFIG
  ? loadProjectConfig({
      configPath: rawEnvironment.PROJECT_CONFIG,
      workspaceRoot: runnerPaths.workspaceRoot,
    })
  : undefined;
const targetEnvironment = rawEnvironment.TARGET_ENV ?? projectConfig?.defaultEnvironment ?? 'local';

if (targetEnvironment === 'production' && !rawEnvironment.ALLOW_PRODUCTION) {
  throw new Error(
    'Production execution is blocked. Set ALLOW_PRODUCTION=true only after confirming the target and test-data safety.',
  );
}

const selectedEnvironment = projectConfig?.environments[targetEnvironment];
const selectedSuite = projectConfig?.suites[rawEnvironment.SUITE];

export const runnerEnvironment = Object.freeze({
  ...rawEnvironment,
  BASE_URL: rawEnvironment.BASE_URL ?? selectedEnvironment?.baseUrl ?? 'http://localhost:3000',
  PROJECT_ID: projectConfig?.id,
  SPEC_GLOB: rawEnvironment.SPEC_GLOB ?? projectConfig?.specGlob,
  SUITE_GREP: selectedSuite?.grep,
  TARGET_ENV: targetEnvironment,
});
export type RunnerEnvironment = typeof runnerEnvironment;
