
import { Canvas } from "@react-three/fiber";

export default function RobotScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={2} />

      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
    </Canvas>
  );
}