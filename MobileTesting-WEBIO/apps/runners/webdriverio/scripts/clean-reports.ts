import { rm } from 'node:fs/promises';

import { runnerPaths } from '../src/runtime/paths.js';

const generatedReportTargets = [
  runnerPaths.executionsRoot,
  runnerPaths.legacyAllureResults,
  runnerPaths.legacyAllureReport,
];

await Promise.all(
  generatedReportTargets.map(async (target) => rm(target, { force: true, recursive: true })),
);

process.stdout.write('Generated execution reports and legacy Allure results were removed.\n');
