import { spawnSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';

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
      PROJECT_CONFIG: 'projects/amazon-web-project/project.config.json',
      BASE_URL: 'https://www.amazon.com',
      SPEC_GLOB: 'projects/amazon-web-project/**/*.spec.mjs',
      TARGET_ENV: 'production',
      ALLOW_PRODUCTION: 'true',
      BROWSER: 'chrome',
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
