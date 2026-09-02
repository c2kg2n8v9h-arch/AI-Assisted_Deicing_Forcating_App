export const ENVIRONMENT_NAMES = ['local', 'qa', 'staging', 'production'] as const;
export type EnvironmentName = (typeof ENVIRONMENT_NAMES)[number];

export const SUITE_NAMES = ['all', 'smoke', 'regression'] as const;
export type SuiteName = (typeof SUITE_NAMES)[number];

export interface EnvironmentConfig {
  readonly baseUrl: string;
}

export interface SuiteConfig {
  readonly grep?: string | undefined;
}

export interface ProjectExecutionConfig {
  readonly defaultEnvironment: EnvironmentName;
  readonly environments: Record<EnvironmentName, EnvironmentConfig>;
  readonly id: string;
  readonly specGlob: string;
  readonly suites: Record<SuiteName, SuiteConfig>;
}

export interface ExecutionMetadata {
  readonly browser: string;
  readonly environment: EnvironmentName;
  readonly profile: string;
  readonly projectId: string;
  readonly runId: string;
  readonly startedAt: string;
  readonly suite: SuiteName;
}

export interface ExecutionSummary extends ExecutionMetadata {
  readonly durationMs: number;
  readonly exitCode: number;
  readonly finishedAt: string;
  readonly status: 'passed' | 'failed';
}
