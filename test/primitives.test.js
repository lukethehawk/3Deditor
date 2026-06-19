import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  createBoxGeometryFromBase,
  createCylinderGeometryFromBase,
  createExtrudedPolygonGeometry,
} from '../src/primitives.js';

test('createBoxGeometryFromBase places the base on the picked point z', () => {
  const geometry = createBoxGeometryFromBase(
    new THREE.Vector3(10, 20, 3),
    new THREE.Vector3(8, 6, 4),
  );
  geometry.computeBoundingBox();
  assert.equal(geometry.boundingBox.min.z, 3);
  assert.equal(geometry.boundingBox.max.z, 7);
});

test('createCylinderGeometryFromBase extrudes along the chosen axis', () => {
  const geometry = createCylinderGeometryFromBase(
    new THREE.Vector3(1, 2, 3),
    2,
    10,
    new THREE.Vector3(1, 0, 0),
  );
  geometry.computeBoundingBox();
  assert.equal(Math.round(geometry.boundingBox.min.x), 1);
  assert.equal(Math.round(geometry.boundingBox.max.x), 11);
});

test('createExtrudedPolygonGeometry creates a solid from a closed 2D face', () => {
  const geometry = createExtrudedPolygonGeometry(
    [
      new THREE.Vector3(0, 0, 2),
      new THREE.Vector3(10, 0, 2),
      new THREE.Vector3(10, 10, 2),
      new THREE.Vector3(0, 10, 2),
    ],
    5,
  );
  geometry.computeBoundingBox();
  assert.equal(geometry.boundingBox.min.z, 2);
  assert.equal(geometry.boundingBox.max.z, 7);
});

