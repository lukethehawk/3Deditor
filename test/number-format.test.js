import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDecimal, parseDecimal } from '../src/number-format.js';

test('parseDecimal accepts comma decimals', () => {
  assert.equal(parseDecimal('0,25'), 0.25);
});

test('parseDecimal accepts dot decimals', () => {
  assert.equal(parseDecimal('0.25'), 0.25);
});

test('parseDecimal returns fallback for invalid values', () => {
  assert.equal(parseDecimal('abc', 7), 7);
});

test('formatDecimal uses comma decimals and trims zeroes', () => {
  assert.equal(formatDecimal(0.25), '0,25');
  assert.equal(formatDecimal(5), '5');
});
