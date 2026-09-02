export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly AI_ENABLED?: 'true' | 'false';
      readonly AI_MODEL?: string;
      readonly AI_PROVIDER?: string;
      readonly ALLOW_PRODUCTION?: 'true' | 'false';
      readonly BASE_URL?: string;
      readonly BROWSER?: 'chrome' | 'edge';
      readonly CHROME_BINARY?: string;
      readonly CHROMEDRIVER_PATH?: string;
      readonly EDGEDRIVER_PATH?: string;
      readonly EDGE_BINARY?: string;
      readonly HEADLESS?: 'true' | 'false';
      readonly LOG_LEVEL?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent';
      readonly MAX_INSTANCES?: string;
      readonly PROJECT_CONFIG?: string;
      readonly RUN_MODE?: 'local' | 'headless' | 'ci';
      readonly SENSITIVE_SCAN_VALUES?: string;
      readonly SPEC_GLOB?: string;
      readonly SUITE?: 'all' | 'smoke' | 'regression';
      readonly TARGET_ENV?: 'local' | 'qa' | 'staging' | 'production';
      readonly AUTOMATION_RUN_ID?: string;
      readonly AUTOMATION_RUN_STARTED_AT?: string;
    }
  }
}
