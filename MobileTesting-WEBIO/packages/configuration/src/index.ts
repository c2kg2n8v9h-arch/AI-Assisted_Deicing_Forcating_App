import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  ENVIRONMENT_NAMES,
  SUITE_NAMES,
  type ProjectExecutionConfig,
} from '@automation-platform/contracts';
import { z } from 'zod';

const environmentSchema = z.object({
  baseUrl: z.url(),
});

const suiteSchema = z.object({
  grep: z.string().min(1).optional(),
});

const projectExecutionConfigSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  defaultEnvironment: z.enum(ENVIRONMENT_NAMES),
  specGlob: z.string().min(1),
  environments: z.object({
    local: environmentSchema,
    qa: environmentSchema,
    staging: environmentSchema,
    production: environmentSchema,
  }),
  suites: z.object({
    all: suiteSchema,
    smoke: suiteSchema,
    regression: suiteSchema,
  }),
});

export interface LoadProjectConfigOptions {
  readonly configPath: string;
  readonly workspaceRoot: string;
}

export function loadProjectConfig(options: LoadProjectConfigOptions): ProjectExecutionConfig {
  const absolutePath = path.resolve(options.workspaceRoot, options.configPath);

  let rawConfig: unknown;
  try {
    rawConfig = JSON.parse(readFileSync(absolutePath, 'utf8')) as unknown;
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to read project configuration at ${absolutePath}: ${reason}`, {
      cause: error,
    });
  }

  const result = projectExecutionConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    throw new Error(
      `Invalid project configuration at ${absolutePath}:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

export { ENVIRONMENT_NAMES, SUITE_NAMES };
export type {
  EnvironmentName,
  ProjectExecutionConfig,
  SuiteName,
} from '@automation-platform/contracts';
