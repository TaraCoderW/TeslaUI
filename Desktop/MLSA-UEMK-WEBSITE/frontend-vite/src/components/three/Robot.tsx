
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Robot() {
  const ref = useRef<THREE.Group>(null);

  const robot = useGLTF("/models/robot.glb");

  useFrame((state) => {
    if (!ref.current) return;

    const time = state.clock.getElapsedTime();

    ref.current.position.y =
      Math.sin(time * 1.5) * 0.2;

    ref.current.rotation.y =
      THREE.MathUtils.lerp(
        ref.current.rotation.y,
        state.mouse.x * 0.5,
        0.05
      );

    ref.current.rotation.z =
      Math.sin(time) * 0.05;
  });

  return (
    <primitive
      ref={ref}
      object={robot.scene}
      scale={2}
      position={[0, -1.5, 0]}
    />
  );
}

useGLTF.preload("/models/robot.glb");