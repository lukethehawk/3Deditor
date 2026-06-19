import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMeasurement } from '../src/measurement.js';

test('calculateMeasurement returns total and signed axis components', () => {
  const result = calculateMeasurement(
    { x: 2, y: 5, z: 7 },
    { x: 5, y: 1, z: 19 },
  );

  assert.equal(result.dx, 3);
  assert.equal(result.dy, -4);
  assert.equal(result.dz, 12);
  assert.equal(result.total, 13);
  assert.equal(result.dominantAxis, 'z');
  assert.equal(result.isAxisAligned, false);
});

test('calculateMeasurement recognizes an axis-aligned distance', () => {
  const result = calculateMeasurement(
    { x: 0, y: 4, z: 10 },
    { x: 25, y: 4, z: 10 },
  );

  assert.equal(result.total, 25);
  assert.equal(result.dominantAxis, 'x');
  assert.equal(result.isAxisAligned, true);
});
