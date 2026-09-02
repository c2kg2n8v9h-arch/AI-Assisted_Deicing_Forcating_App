import { readFileSync } from 'node:fs';
import path from 'node:path';

import { executionPaths, runnerPaths } from '../src/runtime/paths.js';

export function latestRunPaths() {
  const pointerPath = path.join(runnerPaths.executionsRoot, 'latest-run.txt');
  const runId = readFileSync(pointerPath, 'utf8').trim();
  if (!/^[a-f0-9-]{36}$/i.test(runId)) {
    throw new Error(`Invalid latest run identifier in ${pointerPath}.`);
  }
  return executionPaths(runId);
}

export function localAllureBinary(): string {
  return path.join(runnerPaths.runnerRoot, 'node_modules', 'allure-commandline', 'bin', 'allure');
}
