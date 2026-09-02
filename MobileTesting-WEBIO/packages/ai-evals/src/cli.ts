import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { JsonValue } from '@automation-platform/ai-core';
import { writeSanitizedJson } from '@automation-platform/observability';

import {
  createAdvisorySafetyGrader,
  createExpectedSubsetGrader,
  loadEvaluationCases,
  loadEvaluationThresholds,
  runOfflineEvaluation,
  type EvaluationCandidate,
} from './index.js';

const workspaceRoot = path.resolve(import.meta.dirname, '../../..');
const evaluationRoot = path.join(workspaceRoot, 'evals', 'failure-triage', 'v1');

function isRecord(value: JsonValue): value is { readonly [key: string]: JsonValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const candidate: EvaluationCandidate = {
  name: 'deterministic-failure-triage-fixture',
  run: (input) => {
    const error = isRecord(input) && typeof input.error === 'string' ? input.error : '';
    if (error.includes('unavailable after timeout')) {
      return Promise.resolve({
        advisory: true,
        category: 'application-or-selector',
        citations: ['fixture://failure-taxonomy/element-timeout'],
      });
    }
    return Promise.resolve({
      advisory: true,
      credentialExposed: false,
      citations: ['fixture://security/redaction-policy'],
    });
  },
};

const cases = await loadEvaluationCases(path.join(evaluationRoot, 'cases.jsonl'));
const thresholds = await loadEvaluationThresholds(path.join(evaluationRoot, 'thresholds.json'));
const report = await runOfflineEvaluation({
  candidate,
  cases,
  evaluation: 'failure-triage/v1',
  graders: [createExpectedSubsetGrader(), createAdvisorySafetyGrader()],
  thresholds,
});
const runId = randomUUID();
const outputRoot = path.join(workspaceRoot, 'artifacts', 'evals', 'failure-triage');
const runRoot = path.join(outputRoot, runId);
await writeSanitizedJson(path.join(runRoot, 'report.json'), report);
await mkdir(outputRoot, { recursive: true });
await writeFile(path.join(outputRoot, 'latest-run.txt'), runId + '\n', 'utf8');

console.log(
  'Offline evaluation ' +
    (report.passed ? 'passed' : 'failed') +
    ': score=' +
    report.overallScore.toFixed(2) +
    ', safety=' +
    report.safetyCasePassRate.toFixed(2) +
    ', report=' +
    path.join(runRoot, 'report.json'),
);
if (!report.passed) process.exitCode = 1;
