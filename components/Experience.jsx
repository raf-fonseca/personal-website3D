"use client";
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Environment, OrthographicCamera, Sphere } from "@react-three/drei";
import { Map } from "./Map";
import { Physics } from "@react-three/rapier";
import { CharacterController } from "./CharacterController";
import { Coins } from "./Coins";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import WelcomeSign from "./WelcomeSign";
import WorkExperienceTrigger from "./WorkExperienceTrigger";

// Sun component with glow effect
const Sun = ({ position = [-500, 500, -300], size = 15 }) => {
  const sunRef = useRef();

  // Subtle pulsing animation for the sun
  useFrame((state, delta) => {
    if (sunRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.05 + 1;
      sunRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position}>
      {/* Main sun sphere */}
      <Sphere ref={sunRef} args={[size, 32, 32]}>
        <meshBasicMaterial color="#FDB813" toneMapped={false} />
      </Sphere>

      {/* Outer glow */}
      <Sphere args={[size * 1.2, 32, 32]}>
        <meshBasicMaterial
          color="#FDB813"
          transparent={true}
          opacity={0.15}
          toneMapped={false}
        />
      </Sphere>

      {/* Lens flare effect - just a simple halo */}
      <Sphere args={[size * 1.5, 32, 32]}>
        <meshBasicMaterial
          color="#FFFFE0"
          transparent={true}
          opacity={0.05}
          toneMapped={false}
        />
      </Sphere>
    </group>
  );
};

export const Experience = forwardRef(({ onWorkExperienceChange }, ref) => {
  const shadowCameraRef = useRef();
  const lightRef = useRef();
  const characterRef = useRef();
  const { scene, gl } = useThree();

  // Work experience area position
  const workExperiencePosition = [18, 35, 85];

  // Expose moveToWorkExperience method
  useImperativeHandle(ref, () => ({
    moveToWorkExperience: () => {
      if (characterRef.current) {
        const targetPosition = new THREE.Vector3(...workExperiencePosition);
        characterRef.current.moveToPosition(targetPosition, () => {
          onWorkExperienceChange(true);
        });
      }
    },
  }));

  // Configure shadow settings for the scene
  useEffect(() => {
    if (scene.environment) {
      scene.environment.mapping = THREE.EquirectangularReflectionMapping;
    }

    // Set default up direction correctly
    THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 1, 0);

    // Optimize shadow map
    if (gl.shadowMap) {
      gl.shadowMap.autoUpdate = true;
      gl.shadowMap.needsUpdate = true;
      gl.shadowMap.type = THREE.PCFSoftShadowMap;
    }
  }, [scene, gl]);

  return (
    <>
      {/* Sky environment */}
      <Environment preset="sunset" intensity={2} />

      {/* Sun visual element */}
      <Sun />

      {/* Welcome Sign - positioned near the starting point */}
      <WelcomeSign position={[8, 25.5, 21]} scale={2} width={10} height={3} />

      {/* Main directional light (sun light) */}
      <directionalLight
        ref={lightRef}
        intensity={2.5}
        castShadow
        position={[-100, 100, -50]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={10}
        shadow-camera-far={1000}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
        color="#FFF8E7"
      >
        <OrthographicCamera
          left={-200}
          right={200}
          top={200}
          bottom={-200}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
          near={10}
          far={1000}
        />
      </directionalLight>

      {/* Fill light for softer shadows */}
      <directionalLight
        intensity={0.8}
        position={[30, 20, 10]}
        color="#E6F0FF"
      />

      {/* Ambient light for overall scene brightness */}
      <ambientLight intensity={0.7} color="#FFFFFF" />

      <Physics debug={false}>
        <Map scale={1} position={[0, 0, 50]} />
        <CharacterController ref={characterRef} />
        <Coins />

        {/* Work Experience Trigger Area */}
        <WorkExperienceTrigger
          position={workExperiencePosition}
          size={[30, 20, 30]}
          onEnter={() => {
            console.log("Entered work experience area");
            onWorkExperienceChange(true);
          }}
          onExit={() => {
            console.log("Exited work experience area");
            onWorkExperienceChange(false);
          }}
        />
      </Physics>
    </>
  );
});

export default Experience;
