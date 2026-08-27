import test from 'node:test';
import assert from 'node:assert/strict';
import { classifySyncError, getRetryDelayMs, shouldRetrySync } from './syncRetry.js';

test('retry delay follows exponential backoff', () => {
  assert.equal(getRetryDelayMs(0), 30000);
  assert.equal(getRetryDelayMs(1), 60000);
  assert.equal(getRetryDelayMs(4), 900000);
});

test('sync queue only retries while attempts remain', () => {
  const now = Date.now();

  assert.equal(
    shouldRetrySync({ status: 'PENDING', attempts: 0, nextRetryAt: new Date(now - 1000).toISOString() }, now),
    true,
  );

  assert.equal(
    shouldRetrySync({ status: 'FAILED', attempts: 6, nextRetryAt: new Date(now - 1000).toISOString() }, now),
    false,
  );
});

test('duplicate and validation errors are treated as conflict', () => {
  assert.equal(classifySyncError('duplicate transaction already exists'), 'CONFLICT');
  assert.equal(classifySyncError('validation failed for order'), 'CONFLICT');
  assert.equal(classifySyncError('network timeout'), 'TRANSIENT');
});
