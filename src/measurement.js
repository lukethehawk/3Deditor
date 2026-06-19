export function calculateMeasurement(start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const dz = end.z - start.z;
  const total = Math.hypot(dx, dy, dz);
  const components = { x: Math.abs(dx), y: Math.abs(dy), z: Math.abs(dz) };
  const dominantAxis = Object.entries(components).reduce(
    (largest, current) => (current[1] > largest[1] ? current : largest),
    ['x', components.x],
  )[0];

  return {
    dx,
    dy,
    dz,
    total,
    dominantAxis,
    isAxisAligned:
      [components.x, components.y, components.z].filter((value) => value > 1e-6).length <= 1,
  };
}
