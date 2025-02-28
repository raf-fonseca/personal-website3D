"use client";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Experience } from "@/components/Experience";
import Navbar from "@/components/Navbar";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "up", keys: ["Space"] },
  { name: "down", keys: ["ShiftLeft", "KeyC"] },
  { name: "run", keys: ["ShiftRight"] },
];

function App() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navbar positioned absolutely at the top */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Canvas taking up the entire screen */}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 80, -100], near: 0.1, fov: 40 }}
          style={{
            touchAction: "none",
          }}
          className="w-full h-full"
        >
          <color attach="background" args={["#000000"]} />
          <Experience />
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

export default App;
