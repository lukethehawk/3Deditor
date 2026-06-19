import * as THREE from 'three';

export const WORLD_AXES = [
  new THREE.Vector3(1, 0, 0),
  new THREE.Vector3(0, 1, 0),
  new THREE.Vector3(0, 0, 1),
];

export function snapScalarToGrid(value, gridSize = 1) {
  if (!(gridSize > 0)) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(point, gridSize = 1) {
  return new THREE.Vector3(
    snapScalarToGrid(point.x, gridSize),
    snapScalarToGrid(point.y, gridSize),
    snapScalarToGrid(point.z, gridSize),
  );
}

export function collectGeometryVertices(geometry, limit = 6000) {
  const position = geometry?.getAttribute('position');
  if (!position) return [];

  const step = Math.max(1, Math.ceil(position.count / limit));
  const vertices = [];
  const keySet = new Set();
  const point = new THREE.Vector3();

  for (let index = 0; index < position.count; index += step) {
    point.fromBufferAttribute(position, index);
    const key = `${point.x.toFixed(3)}:${point.y.toFixed(3)}:${point.z.toFixed(3)}`;
    if (keySet.has(key)) continue;
    keySet.add(key);
    vertices.push(point.clone());
  }

  return vertices;
}

export function findNearestSnapPoint(point, snapPoints, maxDistance = 2.5) {
  let best = null;
  let bestDistanceSq = maxDistance * maxDistance;

  for (const candidate of snapPoints) {
    const distanceSq = candidate.distanceToSquared(point);
    if (distanceSq <= bestDistanceSq) {
      bestDistanceSq = distanceSq;
      best = candidate;
    }
  }

  if (!best) return null;
  return {
    point: best.clone(),
    distance: Math.sqrt(bestDistanceSq),
    kind: 'vertice',
  };
}

export function snapPoint(point, options = {}) {
  const {
    gridSize = 1,
    snapPoints = [],
    snapDistance = 2.5,
    keepOriginalZ = false,
  } = options;
  const gridPoint = snapPointToGrid(point, gridSize);
  if (keepOriginalZ) gridPoint.z = point.z;

  const nearest = findNearestSnapPoint(point, snapPoints, snapDistance);
  if (nearest) return nearest;

  return {
    point: gridPoint,
    distance: point.distanceTo(gridPoint),
    kind: 'griglia',
  };
}

export function snapPointToAxis(start, point, thresholdDegrees = 12) {
  const delta = point.clone().sub(start);
  const length = delta.length();
  if (length < 1e-8) {
    return { point: point.clone(), axis: null };
  }

  const direction = delta.clone().normalize();
  const threshold = Math.cos(THREE.MathUtils.degToRad(thresholdDegrees));
  let bestAxis = null;
  let bestScore = -Infinity;

  WORLD_AXES.forEach((axis, index) => {
    const score = Math.abs(direction.dot(axis));
    if (score > bestScore) {
      bestScore = score;
      bestAxis = index;
    }
  });

  if (bestScore < threshold) return { point: point.clone(), axis: null };

  const axisVector = WORLD_AXES[bestAxis];
  const projected = start.clone().addScaledVector(axisVector, delta.dot(axisVector));
  return {
    point: projected,
    axis: bestAxis,
  };
}
