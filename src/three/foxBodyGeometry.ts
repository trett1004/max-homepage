import * as THREE from "three";

const RADIAL_SEGMENTS = 4;
const HEIGHT_SEGMENTS = 3;
const RING_VERTEX_COUNT = RADIAL_SEGMENTS + 1;
// CylinderGeometry lays its vertices out as: every side ring from the top down,
// then the top cap, then the bottom cap. Each cap is RADIAL_SEGMENTS centre
// vertices followed by RING_VERTEX_COUNT rim vertices.
const SIDE_VERTEX_COUNT = RING_VERTEX_COUNT * (HEIGHT_SEGMENTS + 1);
const CAP_VERTEX_COUNT = RADIAL_SEGMENTS + RING_VERTEX_COUNT;
const TOP_CAP_END = SIDE_VERTEX_COUNT + CAP_VERTEX_COUNT;
// Only the rings above the legs twist; the lowest one stays put.
const TWISTED_SIDE_VERTEX_COUNT = RING_VERTEX_COUNT * HEIGHT_SEGMENTS;

export function createFoxBodyGeometry() {
  const geometry = new THREE.CylinderGeometry(
    42,
    68,
    200,
    RADIAL_SEGMENTS,
    HEIGHT_SEGMENTS,
  );
  const position = geometry.attributes.position;
  const initialPositions = new Float32Array(position.array.length);
  initialPositions.set(position.array);
  return { geometry, initialPositions };
}

/**
 * Twists the body's upper rings around the Y axis by a fraction of hAngle
 * that's strongest at the very top (in sync with the head) and halves per
 * ring going down, so the neck appears to wring itself as the head turns.
 */
export function twistFoxBody(
  geometry: THREE.BufferGeometry,
  initialPositions: Float32Array,
  hAngle: number,
) {
  const position = geometry.attributes.position;

  const rotateVertex = (index: number, angle: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const ix = index * 3;
    const x0 = initialPositions[ix];
    const z0 = initialPositions[ix + 2];
    position.setX(index, x0 * cos + z0 * sin);
    position.setZ(index, -x0 * sin + z0 * cos);
  };

  for (let i = 0; i < TWISTED_SIDE_VERTEX_COUNT; i++) {
    const line = Math.floor(i / RING_VERTEX_COUNT);
    rotateVertex(i, line >= HEIGHT_SEGMENTS - 1 ? 0 : hAngle / (line + 1));
  }

  // The top cap has to follow the top ring by exactly the same angle. Leaving
  // it behind shears it off the crown and opens a gap you can see through.
  for (let i = SIDE_VERTEX_COUNT; i < TOP_CAP_END; i++) {
    rotateVertex(i, hAngle);
  }

  position.needsUpdate = true;
}
