import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  collectGeometrySnapPoints,
  snapPoint,
  snapPointToAxis,
  snapPointToDirections,
} from '../src/snapping.js';

test('snapPoint snaps to the nearest grid position', () => {
  const result = snapPoint(new THREE.Vector3(1.24, 2.76, 0.49), { gridSize: 0.5 });
  assert.equal(result.kind, 'griglia');
  assert.deepEqual(result.point.toArray(), [1, 3, 0.5]);
});

test('snapPoint prefers a nearby model vertex over the grid', () => {
  const vertex = new THREE.Vector3(10, 5, 2);
  const result = snapPoint(new THREE.Vector3(10.4, 5.2, 2.1), {
    gridSize: 1,
    snapPoints: [vertex],
    snapDistance: 1,
  });
  assert.equal(result.kind, 'vertice');
  assert.deepEqual(result.point.toArray(), [10, 5, 2]);
});

test('collectGeometrySnapPoints exposes edge midpoints', () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([
    0, 0, 0,
    10, 0, 0,
    0, 10, 0,
  ], 3));
  const targets = collectGeometrySnapPoints(geometry);
  const result = snapPoint(new THREE.Vector3(5.2, 0.1, 0), {
    snapPoints: targets,
    snapDistance: 1,
  });

  assert.equal(result.kind, 'punto medio');
  assert.deepEqual(result.point.toArray(), [5, 0, 0]);
});

test('snapPointToAxis locks nearly horizontal movement to the X axis', () => {
  const result = snapPointToAxis(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(20, 2, 0.1),
  );
  assert.equal(result.axis, 0);
  assert.deepEqual(result.point.toArray(), [20, 0, 0]);
});

test('snapPointToDirections infers a parallel direction', () => {
  const result = snapPointToDirections(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(10, 1, 0),
    [new THREE.Vector3(1, 0, 0)],
  );
  assert.equal(result.directionIndex, 0);
  assert.deepEqual(result.point.toArray(), [10, 0, 0]);
});

