import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

import { latestRunPaths, localAllureBinary } from './report-utils.js';

const paths = latestRunPaths();
if (!existsSync(paths.allureResults)) {
  throw new Error(`Allure results do not exist at ${paths.allureResults}.`);
}

const result = spawnSync(
  process.execPath,
  [localAllureBinary(), 'generate', paths.allureResults, '--output', paths.allureReport, '--clean'],
  {
    stdio: 'inherit',
  },
);

if (result.error) {
  throw new Error(`Unable to start the Allure generator: ${result.error.message}`, {
    cause: result.error,
  });
}
if (result.status !== 0) {
  throw new Error(`Allure report generation failed with exit code ${String(result.status)}.`);
}

process.stdout.write(`Allure HTML report generated at ${paths.allureReport}.\n`);
