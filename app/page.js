"use client";
import { Suspense, useState, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { Island } from "@/components/Island";
import { Robot } from "@/components/Robot";
import { Button } from "@/components/ui/button";
import Loader from "@/components/Loader";
import WorkExperience from "@/components/work_experience/page";

export default function Home() {
  const [currentStage, setCurrentStage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [islandAnimationComplete, setIslandAnimationComplete] = useState(false);
  const [robotPosition, setRobotPosition] = useState([0, -0.35, 0.6]);
  const [dimensions, setDimensions] = useState({
    scale: 0.01,
    position: [0, -0.5, 1],
    robotScale: 0.28,
  });
  const cameraRef = useRef();
  const [gameStarted, setGameStarted] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    // Handle window resize
    const adjustSizes = () => {
      if (window.innerWidth < 768) {
        setDimensions({
          scale: 0.008,
          position: [0, -2.5, 0],
          robotScale: 0.06,
        });
      } else {
        setDimensions({
          scale: 0.01,
          position: [0, -0.5, 0],
          robotScale: 0.12,
        });
      }
    };

    // Initial adjustment
    adjustSizes();

    // Add resize listener
    window.addEventListener("resize", adjustSizes);
    return () => window.removeEventListener("resize", adjustSizes);
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      <Canvas
        camera={{
          fov: 45,
          near: 0.1,
          far: 2000,
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
            scale={dimensions.scale}
            position={dimensions.position}
            setCurrentStage={setCurrentStage}
            setIsLoading={setIsLoading}
            setIslandAnimationComplete={setIslandAnimationComplete}
            gameStarted={gameStarted}
            robotPosition={robotPosition}
          />

          <Robot
            scale={dimensions.robotScale}
            islandAnimationComplete={islandAnimationComplete}
            setRobotPosition={setRobotPosition}
            gameStarted={gameStarted}
            setShowAbout={setShowAbout}
          />
        </Suspense>
      </Canvas>

      {islandAnimationComplete && !gameStarted && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Button
            variant="island"
            size="lg"
            className="font-bold text-xl hover:scale-110 transition-all duration-300"
            onClick={() => {
              setGameStarted(true);
            }}
          >
            Start
          </Button>
        </div>
      )}

      <WorkExperience isVisible={showAbout} />
    </main>
  );
}
