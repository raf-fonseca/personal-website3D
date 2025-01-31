"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Island } from "@/components/Island";

export default function Home() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
          position: [5, 5, 5],
        }}
        style={{ width: "100vw", height: "100vh" }}
      >
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Island />
      </Canvas>
    </main>
  );
}
