import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

// Glowing H.A.R.T Core (RA.One's characteristic weapon/core)
const HartCore = ({ position }: { position: [number, number, number] }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5;
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1} wireframe />
        </mesh>
        <mesh scale={0.8}>
          <octahedronGeometry args={[1.5, 0]} />
          <meshBasicMaterial color="#ff2222" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.5, 0.05, 16, 100]} />
          <meshBasicMaterial color="#ff0000" transparent opacity={0.8} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[2.8, 0.02, 16, 100]} />
          <meshBasicMaterial color="#ff5555" transparent opacity={0.4} />
        </mesh>
      </Float>
    </group>
  );
};

// Cybernetic floating glass cubes representing data blocks breaking down
const CyberCubes = () => {
  const cubesCount = 50;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const cubes = useMemo(() => {
    return Array.from({ length: cubesCount }, () => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 15 - 5
      ],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      scale: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.5 + 0.1
    }));
  }, [cubesCount]);

  useFrame((state) => {
    if (meshRef.current) {
      cubes.forEach((cube, i) => {
        dummy.position.set(cube.position[0], cube.position[1] + Math.sin(state.clock.elapsedTime * cube.speed) * 2, cube.position[2]);
        dummy.rotation.set(cube.rotation[0] + state.clock.elapsedTime * 0.2, cube.rotation[1] + state.clock.elapsedTime * 0.3, 0);
        dummy.scale.setScalar(cube.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <instancedMesh ref={meshRef} args={[new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: "#ff0000", wireframe: true, transparent: true, opacity: 0.15 }), cubesCount]}>
    </instancedMesh>
  );
}

const ScrollCamera = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Normalize scroll loosely based on typical body height
      setScrollY(window.scrollY / 1000);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state) => {
    // smoothly interpolate camera position based on scroll
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, -scrollY * 5, 0.05);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, Math.sin(scrollY) * 1.5, 0.05);
    state.camera.lookAt(0, -scrollY * 5, 0);
  });

  return null;
}

const RAOneArtifacts3D = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-60">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#ff0000" />
        
        {/* Artifacts placed down the scroll path */}
        <HartCore position={[5, -4, -3]} />
        <HartCore position={[-6, -15, -6]} />
        <HartCore position={[5, -28, -4]} />
        <HartCore position={[-4, -40, -5]} />

        <CyberCubes />
        
        <ScrollCamera />
      </Canvas>
    </div>
  );
};

export default RAOneArtifacts3D;
