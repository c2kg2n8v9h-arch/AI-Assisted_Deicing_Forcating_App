import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { AgentToolPort, SanitizedEvidence } from './index.js';
import { createDisabledAiRuntime, invokeAgentTool } from './index.js';

const evidence: SanitizedEvidence = {
  classification: 'internal',
  content: { failure: 'sanitized example' },
  execution: {
    browser: 'chrome',
    durationMs: 10,
    environment: 'qa',
    exitCode: 1,
    finishedAt: '2026-09-01T00:00:01.000Z',
    profile: 'ci',
    projectId: 'example',
    runId: 'run-1',
    startedAt: '2026-09-01T00:00:00.000Z',
    status: 'failed',
    suite: 'smoke',
  },
  redacted: true,
};

void describe('disabled AI runtime', () => {
  void it('skips analysis without changing the authoritative execution result', async () => {
    const runtime = createDisabledAiRuntime();
    const result = await runtime.analyze(evidence);

    assert.equal(runtime.enabled, false);
    assert.deepEqual(runtime.capabilities, []);
    assert.equal(result.status, 'skipped');
    assert.equal(evidence.execution.status, 'failed');
  });

  void it('blocks an unapproved write tool before adapter invocation', async () => {
    let invoked = false;
    const tool: AgentToolPort = {
      effect: 'write',
      name: 'create-defect',
      requiresApproval: true,
      invoke: () => {
        invoked = true;
        return Promise.resolve({ created: true });
      },
    };

    await assert.rejects(
      invokeAgentTool(tool, { title: 'example' }, { approved: false, correlationId: 'run-1' }),
      /requires explicit approval/,
    );
    assert.equal(invoked, false);
  });
});
