"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { Island } from "@/components/Island";
import Loader from "@/components/Loader";

export default function Home() {
  const [isRotating, setIsRotating] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const adjustIslandForScreenSize = () => {
    let scale = 0.01;
    let position = [0, -0.5, 0];

    if (window.innerWidth < 768) {
      scale = 0.008;
      position = [0, -2.5, 0];
    }

    return { scale, position };
  };

  const { scale, position } = adjustIslandForScreenSize();

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
          position: [0, 0, 2.5],
        }}
        style={{
          width: "100%",
          height: "100%",
          background: "transparent",
          cursor: isRotating ? "grabbing" : "grab",
          display: "block",
        }}
        shadows
      >
        <Suspense fallback={<Loader />}>
          <Sky
            sunPosition={[500, 200, -1000]}
            turbidity={0.05}
            rayleigh={2}
            mieCoefficient={0.1}
            mieDirectionalG={0.9}
          />
          <Environment preset="dawn" />

          {/* Main sun light */}
          <directionalLight
            position={[10, 8, 5]}
            intensity={2}
            castShadow
            shadow-mapSize={[1024, 1024]}
            color="#ffd7b5"
          />

          {/* Sky light */}
          <ambientLight intensity={0.8} color="#b6d1ff" />

          {/* Complementary fill light */}
          <pointLight position={[-5, 3, -5]} intensity={0.7} color="#80a8ff" />

          <Island
            scale={scale}
            position={position}
            isRotating={isRotating}
            setIsRotating={setIsRotating}
            setCurrentStage={setCurrentStage}
            setIsLoading={setIsLoading}
          />
        </Suspense>
      </Canvas>

      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl">Loading your experience...</div>
        </div>
      )}
    </main>
  );
}
