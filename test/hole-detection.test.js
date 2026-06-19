import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { detectCylindricalHole } from '../src/hole-detection.js';

function inwardCylinderGeometry(radius, depth, segments) {
  const source = new THREE.CylinderGeometry(radius, radius, depth, segments, 1, true);
  source.rotateX(Math.PI / 2);
  const geometry = source.toNonIndexed();
  const position = geometry.getAttribute('position');

  for (let triangle = 0; triangle < position.count / 3; triangle += 1) {
    const second = triangle * 3 + 1;
    const third = triangle * 3 + 2;
    const x = position.getX(second);
    const y = position.getY(second);
    const z = position.getZ(second);
    position.setXYZ(
      second,
      position.getX(third),
      position.getY(third),
      position.getZ(third),
    );
    position.setXYZ(third, x, y, z);
  }
  return geometry;
}

test('detectCylindricalHole recovers an axis-aligned inner cylinder', () => {
  const geometry = inwardCylinderGeometry(4, 6, 32);
  const hole = detectCylindricalHole(geometry, 0);

  assert.equal(hole.axisName, 'z');
  assert.ok(Math.abs(hole.radius - 4) < 0.05);
  assert.ok(Math.abs(hole.depth - 6) < 1e-6);
  assert.ok(hole.center.length() < 1e-6);
});
