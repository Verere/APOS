import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUBSCRIPTION_PACKAGES,
  calculateYearlySavings,
  hasFeature,
  isLimitReached,
} from '../src/utils/subscriptionPackages.js';

test('subscription package catalog stays aligned with supported backend plans', () => {
  const packageNames = SUBSCRIPTION_PACKAGES.map((pkg) => pkg.name);
  assert.deepEqual(packageNames, ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE']);
});

test('yearly savings helper keeps two-month discount behavior', () => {
  assert.equal(calculateYearlySavings(5000), 10000);
  assert.equal(calculateYearlySavings(10000), 20000);
});

test('feature availability checks return expected booleans', () => {
  assert.equal(hasFeature('PROFESSIONAL', 'Barcode printing'), true);
  assert.equal(hasFeature('FREE', 'Barcode printing'), false);
  assert.equal(hasFeature('UNKNOWN', 'Anything'), false);
});

test('limit checks return false below limit and true at limit', () => {
  assert.equal(isLimitReached('BASIC', 'maxProducts', 99), false);
  assert.equal(isLimitReached('BASIC', 'maxProducts', 100), true);
  assert.equal(isLimitReached('PROFESSIONAL', 'maxOrders', 9999), false);
  assert.equal(isLimitReached('PROFESSIONAL', 'maxOrders', 10000), true);
});
