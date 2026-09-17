import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Fox, { type FoxHandle } from "./Fox.tsx";
import { useMousePositionRef } from "./useMousePosition.ts";
import styles from "./LandingHero.module.css";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function Lights() {
  return (
    <>
      <hemisphereLight args={[0xffffff, 0xffffff, 0.5]} />
      <directionalLight
        color={0xffffff}
        intensity={0.8}
        position={[200, 200, 200]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-camera-near={1}
        shadow-camera-far={1000}
      />
      <directionalLight
        color={0xffffff}
        intensity={0.4}
        position={[-100, 200, 50]}
        castShadow
        shadow-camera-left={-500}
        shadow-camera-right={500}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-camera-near={1}
        shadow-camera-far={1000}
      />
    </>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -33, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <shadowMaterial opacity={0.2} />
    </mesh>
  );
}

type ShyState = { running: boolean; intervalId: number | undefined };

function Foxes() {
  const fox1Ref = useRef<FoxHandle>(null!);
  const fox2Ref = useRef<FoxHandle>(null!);
  const fox3Ref = useRef<FoxHandle>(null!);
  const fox2Shy = useRef<ShyState>({ running: false, intervalId: undefined });
  const fox3Shy = useRef<ShyState>({ running: false, intervalId: undefined });
  const mousePos = useMousePositionRef();
  const { size } = useThree();

  useFrame(() => {
    const windowHalfX = size.width / 2;
    const windowHalfY = size.height / 2;
    const tempHA = (mousePos.current.x - windowHalfX) / 200;
    const tempVA = (mousePos.current.y - windowHalfY) / 200;
    const userHAngle = clamp(tempHA, -Math.PI / 3, Math.PI / 3);
    const userVAngle = clamp(tempVA, -Math.PI / 3, Math.PI / 3);
    fox1Ref.current.lookTo(userHAngle, userVAngle);

    const hAngle1 = fox1Ref.current.getHAngle();

    if (hAngle1 < -Math.PI / 5 && !fox2Shy.current.running) {
      fox2Ref.current.lookAway(true);
      fox2Shy.current.running = true;
      fox2Shy.current.intervalId = window.setInterval(
        () => fox2Ref.current.lookAway(false),
        1500,
      );
    } else if (hAngle1 > 0 && fox2Shy.current.running) {
      fox2Ref.current.stare();
      window.clearInterval(fox2Shy.current.intervalId);
      fox2Shy.current.running = false;
    } else if (hAngle1 > Math.PI / 5 && !fox3Shy.current.running) {
      fox3Ref.current.lookAway(true);
      fox3Shy.current.running = true;
      fox3Shy.current.intervalId = window.setInterval(
        () => fox3Ref.current.lookAway(false),
        1500,
      );
    } else if (hAngle1 < 0 && fox3Shy.current.running) {
      fox3Ref.current.stare();
      window.clearInterval(fox3Shy.current.intervalId);
      fox3Shy.current.running = false;
    }

    const fox2Angles = fox2Ref.current.getShyAngles();
    fox2Ref.current.lookTo(fox2Angles.h, fox2Angles.v);
    const fox2Color = fox2Ref.current.getColor();
    fox2Ref.current.applyColor(fox2Color.r, fox2Color.g, fox2Color.b);

    const fox3Angles = fox3Ref.current.getShyAngles();
    fox3Ref.current.lookTo(fox3Angles.h, fox3Angles.v);
    const fox3Color = fox3Ref.current.getColor();
    fox3Ref.current.applyColor(fox3Color.r, fox3Color.g, fox3Color.b);
  });

  return (
    <>
      <group>
        <Fox ref={fox1Ref} side="left" />
      </group>
      <group position={[-250, -8, -100]} scale={[0.8, 0.8, 0.8]}>
        <Fox ref={fox2Ref} side="right" />
      </group>
      <group position={[250, -8, 120]} scale={[0.8, 0.8, 0.8]}>
        <Fox ref={fox3Ref} side="left" />
      </group>
    </>
  );
}

export default function LandingHero() {
  return (
    <Canvas
      shadows
      flat
      className={styles.canvas}
      camera={{ fov: 60, near: 1, far: 2000, position: [0, 300, 1000] }}
      gl={{ alpha: true, antialias: true }}
    >
      <Lights />
      <Floor />
      <Foxes />
    </Canvas>
  );
}
