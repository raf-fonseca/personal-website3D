"use client";
import { KeyboardControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Experience } from "@/components/Experience";
import Navbar from "@/components/Navbar";
import WorkExperience from "@/components/work_experience/page";
import Projects from "@/components/projects/page";
import Contact from "@/components/contact/page";
import MovementInstructions from "@/components/MovementInstructions";
import { useState, useRef } from "react";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "up", keys: ["Space"] },
  { name: "down", keys: ["ShiftLeft"] },
];

function App() {
  const [showWorkExperience, setShowWorkExperience] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const experienceRef = useRef();

  const handleWorkExperienceChange = (value) => {
    setShowWorkExperience(value);
  };

  const handleProjectsChange = (value) => {
    setShowProjects(value);
  };

  const handleContactChange = (value) => {
    setShowContact(value);
  };

  const handleExperienceClick = () => {
    if (experienceRef.current) {
      experienceRef.current.moveToWorkExperience();
    }
  };

  const handleProjectsClick = () => {
    if (experienceRef.current) {
      experienceRef.current.moveToProjects();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navbar positioned absolutely at the top */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar
          onExperienceClick={handleExperienceClick}
          onProjectsClick={handleProjectsClick}
        />
      </div>

      {/* Work Experience Overlay */}
      {showWorkExperience && (
        <WorkExperience onWorkExperienceChange={handleWorkExperienceChange} />
      )}

      {/* Projects Overlay */}
      {showProjects && (
        <Projects
          isVisible={showProjects}
          onClose={() => handleProjectsChange(false)}
        />
      )}

      {/* Contact Overlay */}
      {showContact && <Contact onContactChange={handleContactChange} />}

      {/* Canvas taking up the entire screen */}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows={{ type: "PCFSoftShadowMap", enabled: true }}
          dpr={[1, 2]}
          camera={{ position: [0, 80, -100], near: 0.1, fov: 40 }}
          gl={{
            antialias: true,
            alpha: false,
            stencil: false,
            depth: true,
            powerPreference: "high-performance",
          }}
          style={{
            touchAction: "none",
            background:
              "linear-gradient(to bottom, #94c5f8 0%, #a7daf9 26%, #b6dfff 59%, #daefff 100%)",
          }}
          className="w-full h-full"
          performance={{ min: 0.5 }}
        >
          {/* Set a bright sky blue background */}
          <color attach="background" args={["#87CEEB"]} />
          <Experience
            ref={experienceRef}
            onWorkExperienceChange={handleWorkExperienceChange}
            onProjectsChange={handleProjectsChange}
            onContactChange={handleContactChange}
          />
        </Canvas>
      </KeyboardControls>

      {/* Movement Instructions */}
      <MovementInstructions />
    </div>
  );
}

export default App;
