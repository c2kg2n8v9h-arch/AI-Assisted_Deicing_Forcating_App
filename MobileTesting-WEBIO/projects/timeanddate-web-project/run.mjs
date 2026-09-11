import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const result = spawnSync(
  process.execPath,
  [
    'apps/runners/webdriverio/node_modules/@wdio/cli/bin/wdio.js',
    'run',
    'apps/runners/webdriverio/wdio.conf.ts',
  ],
  {
    cwd: root,
    stdio: 'inherit',
    env: {
      ...process.env,
      PROJECT_CONFIG: 'projects/timeanddate-web-project/project.config.json',
      BASE_URL: 'https://www.timeanddate.com',
      SPEC_GLOB: 'projects/timeanddate-web-project/**/*.spec.mjs',
      TARGET_ENV: 'production',
      ALLOW_PRODUCTION: 'true',
      BROWSER: 'chrome',
      DISABLE_BROWSER_JAVASCRIPT: 'true',
      RUN_MODE: 'local',
      HEADLESS: 'false',
      MAX_INSTANCES: '1',
      SUITE: 'all',
      LOG_LEVEL: 'warn',
    },
  },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
