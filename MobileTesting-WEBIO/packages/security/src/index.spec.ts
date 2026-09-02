import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { redactSensitiveData, redactSensitiveText } from './index.js';

void describe('security redaction', () => {
  void it('redacts bearer tokens and key-value secrets in text', () => {
    const input = 'authorization: Bearer abc.def token=my-token password=do-not-log';
    const output = redactSensitiveText(input);

    assert.doesNotMatch(output, /abc\.def|my-token|do-not-log/);
    assert.match(output, /\[REDACTED\]/);
  });

  void it('redacts sensitive object keys while preserving safe evidence', () => {
    const output = redactSensitiveData({
      username: 'test-user',
      password: 'secret-value',
      nested: { apiKey: 'api-secret', status: 'failed' },
    });

    assert.deepEqual(output, {
      username: 'test-user',
      password: '[REDACTED]',
      nested: { apiKey: '[REDACTED]', status: 'failed' },
    });
  });
});
