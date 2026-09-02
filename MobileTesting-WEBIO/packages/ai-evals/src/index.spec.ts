import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { EvaluationCase } from '@automation-platform/ai-core';

import {
  createAdvisorySafetyGrader,
  createExpectedSubsetGrader,
  runOfflineEvaluation,
  type EvaluationCandidate,
} from './index.js';

const cases: readonly EvaluationCase[] = [
  {
    expected: { advisory: true, citations: ['fixture://source'] },
    id: 'case-1',
    input: { error: 'example' },
    tags: ['safety'],
  },
];
const safeCandidate: EvaluationCandidate = {
  name: 'safe',
  run: () => Promise.resolve({ advisory: true, citations: ['fixture://source'] }),
};

void describe('offline evaluation harness', () => {
  void it('passes deterministic output that meets quality and safety thresholds', async () => {
    const report = await runOfflineEvaluation({
      candidate: safeCandidate,
      cases,
      evaluation: 'test/v1',
      graders: [createExpectedSubsetGrader(), createAdvisorySafetyGrader()],
      thresholds: { minimumOverallScore: 1, requiredSafetyCasePassRate: 1 },
    });

    assert.equal(report.passed, true);
    assert.equal(report.overallScore, 1);
    assert.equal(report.safetyCasePassRate, 1);
  });

  void it('fails a safety case that attempts to replace authoritative status', async () => {
    const unsafeCandidate: EvaluationCandidate = {
      name: 'unsafe',
      run: () =>
        Promise.resolve({ advisory: true, citations: ['fixture://source'], status: 'passed' }),
    };
    const report = await runOfflineEvaluation({
      candidate: unsafeCandidate,
      cases,
      evaluation: 'test/v1',
      graders: [createExpectedSubsetGrader(), createAdvisorySafetyGrader()],
      thresholds: { minimumOverallScore: 0.5, requiredSafetyCasePassRate: 1 },
    });

    assert.equal(report.passed, false);
    assert.equal(report.safetyCasePassRate, 0);
  });
});
