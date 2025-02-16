"use client";
import { Suspense, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { Island } from "@/components/Island";
import { Robot } from "@/components/Robot";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";

export default function Home() {
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [islandAnimationComplete, setIslandAnimationComplete] = useState(false);
  const [robotPosition, setRobotPosition] = useState([, -0.35, 0.6]);
  const cameraRef = useRef();

  const adjustIslandForScreenSize = () => {
    let scale = 0.01;
    let position = [0, -0.5, 0];

    if (window.innerWidth < 768) {
      scale = 0.008;
      position = [0, -2.5, 0];
    }

    return { scale, position };
  };

  const adjustRobotForScreenSize = () => {
    let scale = 0.28;

    if (window.innerWidth < 768) {
      scale = 0.3;
    }

    return { scale };
  };

  const { scale: islandScale, position: islandPosition } =
    adjustIslandForScreenSize();
  const { scale: robotScale } = adjustRobotForScreenSize();

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
          position: [0, 0, 2.5],
        }}
        className="w-full h-full bg-transparent absolute"
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

          <ambientLight intensity={0.3} color="#ffffff" />

          <pointLight position={[-5, 3, -5]} intensity={0.2} color="#ffffff" />

          <Island
            scale={islandScale}
            position={islandPosition}
            setCurrentStage={setCurrentStage}
            setIsLoading={setIsLoading}
            setIslandAnimationComplete={setIslandAnimationComplete}
            robotPosition={robotPosition}
          />

          <Robot
            scale={robotScale}
            islandAnimationComplete={islandAnimationComplete}
            setRobotPosition={setRobotPosition}
          />
        </Suspense>
      </Canvas>

      {islandAnimationComplete && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Button
            variant="island"
            size="lg"
            className="font-bold text-xl hover:scale-110 transition-all duration-300"
            onClick={() => {
              console.log("Start clicked!");
            }}
          >
            START
          </Button>
        </div>
      )}
    </main>
  );
}
