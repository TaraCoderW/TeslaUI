import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, useTexture } from "@react-three/drei";
import * as THREE from "three";

const RAOneCore = () => {
  const meshRef = useRef<THREE.Group>(null);
  const texture = useTexture("/srk-gone.png");

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        {/* Main Character Holographic Billboard */}
        <mesh position={[0, -0.5, 0]}>
          <planeGeometry args={[8, 8]} />
          <meshBasicMaterial 
            map={texture} 
            transparent 
            opacity={0.9} 
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        
        {/* Glowing Red Aura */}
        <mesh position={[0, 0, -1]}>
          <circleGeometry args={[2.5, 64]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.15} blending={THREE.AdditiveBlending} />
        </mesh>
        
        {/* Inner Ring */}
        <mesh position={[0, 0, -0.5]}>
          <ringGeometry args={[2.8, 3, 64]} />
          <meshBasicMaterial color="#ff2222" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
      </Float>
    </group>
  );
};

const Particles = () => {
  const count = 500;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
    }
    return p;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#ff1111"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const RAOneScene = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-80" style={{ mixBlendMode: "screen" }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <RAOneCore />
        <Particles />
      </Canvas>
    </div>
  );
};

export default RAOneScene;
