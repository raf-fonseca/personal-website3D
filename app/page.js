"use client";
import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { Island } from "@/components/Island";
import { PirateShip } from "@/components/PirateShip";
import Loader from "@/components/Loader";

export default function Home() {
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

  const adjustShipForScreenSize = () => {
    let scale = 0.25;
    let position = [0, -0.3, 1.25]; // Adjust these values to position the ship relative to the island

    if (window.innerWidth < 768) {
      scale = 0.003;
      position = [0.2, -0.3, 0.5];
    }

    return { scale, position };
  };

  const { scale: islandScale, position: islandPosition } =
    adjustIslandForScreenSize();
  const { scale: shipScale, position: shipPosition } =
    adjustShipForScreenSize();

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
          display: "block",
        }}
        shadows
      >
        <Suspense fallback={<Loader />}>
          <Sky
            sunPosition={[500, 180, -1000]}
            turbidity={0.05}
            rayleigh={1.5}
            mieCoefficient={0.002}
            mieDirectionalG={0.8}
            azimuth={0.25}
            exposure={0.5}
          />
          <Environment preset="sunset" />

          {/* Ambient light for overall scene */}
          <ambientLight intensity={0.3} color="#ffffff" />

          {/* Soft fill light */}
          <pointLight position={[-5, 3, -5]} intensity={0.2} color="#ffffff" />

          <Island
            scale={islandScale}
            position={islandPosition}
            setCurrentStage={setCurrentStage}
            setIsLoading={setIsLoading}
          />

          {/* <PirateShip scale={shipScale} position={shipPosition} /> */}
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
