import { spawnSync } from 'node:child_process';

import { latestRunPaths, localAllureBinary } from './report-utils.js';

const paths = latestRunPaths();
const result = spawnSync(process.execPath, [localAllureBinary(), 'open', paths.allureReport], {
  stdio: 'inherit',
});

if (result.error) {
  throw new Error(`Unable to open the Allure report: ${result.error.message}`, {
    cause: result.error,
  });
}
if (result.status !== 0) {
  throw new Error(`Allure report viewer exited with code ${String(result.status)}.`);
}
