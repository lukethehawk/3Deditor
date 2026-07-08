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

function snapTarget(point, kind) {
  return {
    point: point.clone(),
    kind,
  };
}

function targetPoint(candidate) {
  return candidate?.isVector3 ? candidate : candidate?.point;
}

export function collectGeometrySnapPoints(geometry, limit = 9000) {
  const position = geometry?.getAttribute('position');
  if (!position) return [];

  const triangleTotal = Math.floor(position.count / 3);
  const step = Math.max(1, Math.ceil(triangleTotal / Math.max(1, limit / 6)));
  const targets = [];
  const keySet = new Set();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const c = new THREE.Vector3();
  const midpoint = new THREE.Vector3();

  const addTarget = (point, kind) => {
    const key = `${kind}:${point.x.toFixed(3)}:${point.y.toFixed(3)}:${point.z.toFixed(3)}`;
    if (keySet.has(key)) return;
    keySet.add(key);
    targets.push(snapTarget(point, kind));
  };

  for (let triangle = 0; triangle < triangleTotal; triangle += step) {
    a.fromBufferAttribute(position, triangle * 3);
    b.fromBufferAttribute(position, triangle * 3 + 1);
    c.fromBufferAttribute(position, triangle * 3 + 2);

    addTarget(a, 'vertice');
    addTarget(b, 'vertice');
    addTarget(c, 'vertice');
    addTarget(midpoint.addVectors(a, b).multiplyScalar(0.5), 'punto medio');
    addTarget(midpoint.addVectors(b, c).multiplyScalar(0.5), 'punto medio');
    addTarget(midpoint.addVectors(c, a).multiplyScalar(0.5), 'punto medio');
  }

  return targets;
}

export function findNearestSnapPoint(point, snapPoints, maxDistance = 2.5) {
  let best = null;
  let bestKind = 'vertice';
  let bestDistanceSq = maxDistance * maxDistance;

  for (const candidate of snapPoints) {
    const candidatePoint = targetPoint(candidate);
    if (!candidatePoint) continue;
    const distanceSq = candidatePoint.distanceToSquared(point);
    if (distanceSq <= bestDistanceSq) {
      bestDistanceSq = distanceSq;
      best = candidatePoint;
      bestKind = candidate.kind ?? 'vertice';
    }
  }

  if (!best) return null;
  return {
    point: best.clone(),
    distance: Math.sqrt(bestDistanceSq),
    kind: bestKind,
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

export function snapPointToDirections(start, point, directions = [], thresholdDegrees = 10) {
  const delta = point.clone().sub(start);
  const length = delta.length();
  if (length < 1e-8) {
    return { point: point.clone(), directionIndex: null };
  }

  const threshold = Math.cos(THREE.MathUtils.degToRad(thresholdDegrees));
  const direction = delta.clone().normalize();
  let bestDirection = null;
  let bestIndex = null;
  let bestScore = -Infinity;

  directions.forEach((candidate, index) => {
    const candidateDirection = candidate.clone();
    if (candidateDirection.lengthSq() < 1e-8) return;
    candidateDirection.normalize();
    const score = Math.abs(direction.dot(candidateDirection));
    if (score > bestScore) {
      bestScore = score;
      bestDirection = candidateDirection;
      bestIndex = index;
    }
  });

  if (!bestDirection || bestScore < threshold) {
    return { point: point.clone(), directionIndex: null };
  }

  return {
    point: start.clone().addScaledVector(bestDirection, delta.dot(bestDirection)),
    directionIndex: bestIndex,
  };
}
