import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { createFoxBodyGeometry, twistFoxBody } from "./foxBodyGeometry.ts";

const NORMAL_SKIN = { r: 224 / 255, g: 118 / 255, b: 58 / 255 };
const SHY_SKIN = { r: 207 / 255, g: 74 / 255, b: 38 / 255 };

// Mounted clear of the head, which needs more room than it looks. The face
// group turns by the full hAngle, but the body only twists its top ring that
// far and eases off below, so at eye height the head turns roughly two thirds
// as far as the eyes do. The eyes therefore drift around the head as it turns
// and ride out over a corner of the four-sided column, where the surface sits
// ~48 from the axis instead of the ~34 it sits at mid-face. Measured by
// raycasting the eye at full turn: at 24/34 the head covered 23% of the white,
// at 27/37 it covers ~1%. They cast no shadow, so the clearance costs nothing.
const EYE_X = 27;
const EYE_Y = 126;
const EYE_Z = 37;
// An almond eye: wider than it is tall, and rolled so the outer corner rides
// higher than the inner one. Euler XYZ applies the roll before the yaw, so the
// tilt happens in the eye's own plane rather than skewing where it faces.
const EYE_RADIUS_X = 22;
const EYE_RADIUS_Y = 15;
const EYE_DEPTH = 5;
const EYE_TILT = 0.22;

const PUPIL_RADIUS = 4.5;
// Thin, and pushed forward far enough that its back face stays buried inside
// the white. Any thicker and it pokes out the rear, so a pupil appears on the
// back of the eye when the head turns away.
const PUPIL_THICKNESS = 3;
const PUPIL_LIFT = 2;
// The pupil roams an ellipse shrunk by its own radius, so it stays on the white
// from every direction - a per-axis clamp would still let it escape diagonally.
const PUPIL_INSET = 1;
const PUPIL_RANGE_X = EYE_RADIUS_X - PUPIL_RADIUS - PUPIL_INSET;
const PUPIL_RANGE_Y = EYE_RADIUS_Y - PUPIL_RADIUS - PUPIL_INSET;

const SNOUT_Y = 92;
const EAR_Y = 180;
const EAR_Z = 6;

const pupilOffset = new THREE.Vector3();

/**
 * Sits a pupil on its eye's surface, `across` and `down` being a displacement
 * in the eye's own plane. Routing it through the eye's rotation keeps the pupil
 * on the white whatever the eye's tilt, rather than relying on the two lining
 * up in world axes.
 */
function placePupil(
  pupil: THREE.Mesh,
  eye: THREE.Mesh,
  across: number,
  down: number,
) {
  pupilOffset.set(across, down, PUPIL_LIFT).applyQuaternion(eye.quaternion);
  pupil.position.copy(eye.position).add(pupilOffset);
}

export type FoxHandle = {
  lookTo: (hAngle: number, vAngle: number) => void;
  lookAway: (fast: boolean) => void;
  stare: () => void;
  applyColor: (r: number, g: number, b: number) => void;
  getHAngle: () => number;
  getShyAngles: () => { h: number; v: number };
  getColor: () => { r: number; g: number; b: number };
};

export type FoxProps = {
  side: "left" | "right";
};

const Fox = forwardRef<FoxHandle, FoxProps>(function Fox({ side }, ref) {
  const bodyRef = useRef<THREE.Mesh>(null!);
  const faceRef = useRef<THREE.Group>(null!);
  const leftEyeRef = useRef<THREE.Mesh>(null!);
  const rightEyeRef = useRef<THREE.Mesh>(null!);
  const leftIrisRef = useRef<THREE.Mesh>(null!);
  const rightIrisRef = useRef<THREE.Mesh>(null!);
  const snoutRef = useRef<THREE.Mesh>(null!);
  const leftEarRef = useRef<THREE.Mesh>(null!);
  const rightEarRef = useRef<THREE.Mesh>(null!);

  const { geometry: bodyGeometry, initialPositions } = useMemo(
    () => createFoxBodyGeometry(),
    [],
  );

  // A flat disc facing +Z. Scaled unevenly it gives the eye an almond outline
  // while keeping the flat, faceted look of the rest of the figure - a sphere
  // here reads as a bulging ball rather than an eye set into the face.
  const discGeometry = useMemo(() => {
    const geometry = new THREE.CylinderGeometry(1, 1, 1, 16);
    geometry.rotateX(Math.PI / 2);
    return geometry;
  }, []);

  const furMaterial = useMemo(
    () => new THREE.MeshLambertMaterial({ color: 0xe0763a, flatShading: true }),
    [],
  );
  const whiteMaterial = useMemo(
    () => new THREE.MeshLambertMaterial({ color: 0xffffff, flatShading: true }),
    [],
  );
  const blackMaterial = useMemo(
    () => new THREE.MeshLambertMaterial({ color: 0x2b2b2b, flatShading: true }),
    [],
  );

  const angles = useRef({ hAngle: 0, vAngle: 0 });
  const shyAngles = useRef({ h: 0, v: 0 });
  const color = useRef({ ...NORMAL_SKIN });

  const lookTo = (hAngle: number, vAngle: number) => {
    angles.current.hAngle = hAngle;
    angles.current.vAngle = vAngle;

    const eyeY = EYE_Y - vAngle * 10;
    leftEyeRef.current.position.y = eyeY;
    rightEyeRef.current.position.y = eyeY;

    // Where the pupil wants to look, in the eye's own plane...
    let across = hAngle * 10 * Math.SQRT2;
    let down = -vAngle * 20;
    // ...pulled back onto the ellipse when it would overshoot the white.
    const reach = Math.hypot(across / PUPIL_RANGE_X, down / PUPIL_RANGE_Y);
    if (reach > 1) {
      across /= reach;
      down /= reach;
    }

    placePupil(leftIrisRef.current, leftEyeRef.current, across, down);
    placePupil(rightIrisRef.current, rightEyeRef.current, across, down);

    snoutRef.current.position.y = SNOUT_Y - vAngle * 20;
    snoutRef.current.rotation.x = Math.PI / 2 + vAngle / 3;

    const earRotationX = Math.PI / 8 + vAngle / 2;
    const earY = EAR_Y - vAngle * 10;
    const earZ = EAR_Z + vAngle * 10;
    leftEarRef.current.rotation.x = earRotationX;
    leftEarRef.current.position.y = earY;
    leftEarRef.current.position.z = earZ;
    rightEarRef.current.rotation.x = earRotationX;
    rightEarRef.current.position.y = earY;
    rightEarRef.current.position.z = earZ;

    twistFoxBody(bodyGeometry, initialPositions, hAngle);
    faceRef.current.rotation.y = hAngle;
  };

  const lookAway = (fastMove: boolean) => {
    const speed = fastMove ? 0.4 : 2;
    const ease = fastMove ? "power4.out" : "power4.inOut";
    const delay = fastMove ? 0.2 : 0;
    const targetColor = fastMove ? SHY_SKIN : NORMAL_SKIN;
    const v = ((-1 + Math.random() * 2) * Math.PI) / 3;
    const snoutScaleX = 0.75 + Math.random() * 0.25;
    const snoutScaleZ = 0.5 + Math.random() * 0.5;
    const h =
      side === "right"
        ? ((-1 + Math.random()) * Math.PI) / 4
        : (Math.random() * Math.PI) / 4;

    gsap.killTweensOf(shyAngles.current);
    gsap.to(shyAngles.current, { duration: speed, v, h, ease, delay });
    gsap.to(color.current, {
      duration: speed,
      r: targetColor.r,
      g: targetColor.g,
      b: targetColor.b,
      ease,
      delay,
    });
    gsap.to(snoutRef.current.scale, {
      duration: speed,
      z: snoutScaleZ,
      x: snoutScaleX,
      ease,
      delay,
    });
  };

  const stare = () => {
    const h = side === "right" ? Math.PI / 3 : -Math.PI / 3;
    gsap.to(shyAngles.current, {
      duration: 2,
      v: -0.5,
      h,
      ease: "power4.inOut",
    });
    gsap.to(color.current, {
      duration: 2,
      r: NORMAL_SKIN.r,
      g: NORMAL_SKIN.g,
      b: NORMAL_SKIN.b,
      ease: "power4.inOut",
    });
    gsap.to(snoutRef.current.scale, {
      duration: 2,
      z: 0.8,
      x: 1.5,
      ease: "power4.inOut",
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      lookTo,
      lookAway,
      stare,
      applyColor: (r, g, b) => furMaterial.color.setRGB(r, g, b),
      getHAngle: () => angles.current.hAngle,
      getShyAngles: () => shyAngles.current,
      getColor: () => color.current,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <group>
      <mesh
        ref={bodyRef}
        geometry={bodyGeometry}
        material={furMaterial}
        position={[0, 70, 0]}
        castShadow
        receiveShadow
      />

      {/* Brush tail, sunk into the back so it reads as part of the body. */}
      <mesh
        material={furMaterial}
        position={[0, 24, -76]}
        rotation={[Math.PI / 2.3, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0, 36, 100, 4, 1]} />
      </mesh>
      <mesh
        material={whiteMaterial}
        position={[0, 14, -122]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[30, 30, 24]} />
      </mesh>

      <group position={[66, -4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh
          material={furMaterial}
          rotation={[-Math.PI / 10, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[34, 78, 12]} />
        </mesh>
      </group>
      <group position={[-66, -4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh
          material={furMaterial}
          rotation={[-Math.PI / 10, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[34, 78, 12]} />
        </mesh>
      </group>

      <group ref={faceRef}>
        {/* The eyes deliberately cast no shadow. They sit proud of the head by
            a couple of units, and at this sun angle that is enough to smear a
            shadow across the muzzle that reads as dirt rather than depth. */}
        <mesh
          ref={rightEyeRef}
          geometry={discGeometry}
          material={whiteMaterial}
          position={[EYE_X, EYE_Y, EYE_Z]}
          rotation={[0, Math.PI / 4, EYE_TILT]}
          scale={[EYE_RADIUS_X, EYE_RADIUS_Y, EYE_DEPTH]}
          receiveShadow
        />
        <mesh
          ref={rightIrisRef}
          geometry={discGeometry}
          material={blackMaterial}
          position={[EYE_X, EYE_Y, EYE_Z + PUPIL_LIFT]}
          rotation={[0, Math.PI / 4, EYE_TILT]}
          scale={[PUPIL_RADIUS, PUPIL_RADIUS, PUPIL_THICKNESS]}
        />
        <mesh
          ref={leftEyeRef}
          geometry={discGeometry}
          material={whiteMaterial}
          position={[-EYE_X, EYE_Y, EYE_Z]}
          rotation={[0, -Math.PI / 4, -EYE_TILT]}
          scale={[EYE_RADIUS_X, EYE_RADIUS_Y, EYE_DEPTH]}
          receiveShadow
        />
        <mesh
          ref={leftIrisRef}
          geometry={discGeometry}
          material={blackMaterial}
          position={[-EYE_X, EYE_Y, EYE_Z + PUPIL_LIFT]}
          rotation={[0, -Math.PI / 4, -EYE_TILT]}
          scale={[PUPIL_RADIUS, PUPIL_RADIUS, PUPIL_THICKNESS]}
        />

        {/* Muzzle. Its base sits inside the head so turning never opens a gap. */}
        <mesh
          ref={snoutRef}
          material={furMaterial}
          position={[0, SNOUT_Y, 58]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
          receiveShadow
        >
          {/* Blunt-ended, not tapered to a point: the nose pad needs a face to
              sit on, otherwise it reads as a ball stuck on a spike. */}
          <cylinderGeometry args={[10, 22, 42, 4, 1]} />
          <mesh
            material={blackMaterial}
            position={[0, 21, 0]}
            scale={[10, 7, 8.5]}
            castShadow
          >
            <sphereGeometry args={[1, 12, 8]} />
          </mesh>
        </mesh>

        <mesh
          ref={rightEarRef}
          material={furMaterial}
          position={[34, EAR_Y, EAR_Z]}
          rotation={[Math.PI / 8, 0, -Math.PI / 10]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0, 23, 54, 4, 1]} />
        </mesh>
        <mesh
          ref={leftEarRef}
          material={furMaterial}
          position={[-34, EAR_Y, EAR_Z]}
          rotation={[Math.PI / 8, 0, Math.PI / 10]}
          castShadow
          receiveShadow
        >
          <cylinderGeometry args={[0, 23, 54, 4, 1]} />
        </mesh>
      </group>
    </group>
  );
});

export default Fox;
