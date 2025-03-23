"use client";
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
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
import ProjectTrigger from "./ProjectTrigger";
import MessageSign from "./MessageSign";
import ContactMeTrigger from "./ContactMeTrigger";

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

export const Experience = forwardRef(
  (
    {
      onWorkExperienceChange,
      onProjectsChange,
      onContactChange,
      onAutomaticModeChange,
    },
    ref
  ) => {
    const shadowCameraRef = useRef();
    const lightRef = useRef();
    const characterRef = useRef();
    const { scene, gl } = useThree();
    const [isInWorkExperienceZone, setIsInWorkExperienceZone] = useState(false);
    const [isInProjectsZone, setIsInProjectsZone] = useState(false);
    const [isInContactZone, setIsInContactZone] = useState(false);
    const [targetSection, setTargetSection] = useState(null);
    const [isAutomaticMode, setIsAutomaticMode] = useState(false);
    const [visitedAreas, setVisitedAreas] = useState({
      workExperience: false,
      projects: false,
      contact: false,
    });

    // Update parent component when isAutomaticMode changes
    useEffect(() => {
      onAutomaticModeChange?.(isAutomaticMode);
    }, [isAutomaticMode, onAutomaticModeChange]);

    // Area positions
    const workExperiencePosition = [13.832, 35.786, 85.436]; // 6th coin position
    const projectsPosition = [20, 51, 60.436];
    const startingPosition = [0, 10, 0];
    const contactPosition = [0, 65, 50]; // Position at the top

    // Get coin positions from Coins component
    const coinPositions = [
      [-3.832, 23.786, 15.436],
      [-20.832, 26.786, 30.436],
      [-25.832, 30.786, 45.436],
      [-20.832, 31.786, 65.436],
      [-5.832, 33.786, 80.436],
      [13.832, 35.786, 80.436], // 6th coin - Work Experience Target
      [30, 35.786, 70.436],
      [35, 38.786, 50.436],
      [25, 40.786, 30.436],
      [5, 40.786, 25.436],
      [-9, 43.786, 28.436],
      [-17, 45.786, 45.436],
      [-17, 48.786, 60.436],
      [-5, 48.786, 70.436],
      [20, 53.786, 65.436], // 15th coin - Projects Target
    ];

    // Create paths for each target
    const workExperiencePath = coinPositions
      .slice(0, 6)
      .map((pos) => new THREE.Vector3(...pos));
    const projectsPath = coinPositions
      .slice(0, 15)
      .map((pos) => new THREE.Vector3(...pos));
    const contactPath = [
      ...coinPositions.slice(0, 15).map((pos) => new THREE.Vector3(...pos)),
      new THREE.Vector3(22, 53.786, 50.436), // 16th coin
      new THREE.Vector3(12, 53.786, 35.436), // 17th coin
      new THREE.Vector3(0, 53.786, 35.436), // 18th coin
      new THREE.Vector3(-11, 53.786, 45.436), // 19th coin
      new THREE.Vector3(-4, 65, 50), // 20th coin - Contact Target
    ];

    // Expose methods
    useImperativeHandle(ref, () => ({
      moveToWorkExperience: () => {
        if (characterRef.current) {
          if (visitedAreas.workExperience) {
            onWorkExperienceChange(true);
            return;
          }
          setIsAutomaticMode(true);
          setTargetSection("workExperience");
          if (isInWorkExperienceZone) {
            onWorkExperienceChange(true);
          } else {
            const currentPos = characterRef.current.getCurrentPosition();
            const startPos = new THREE.Vector3(...startingPosition);
            const lastCollectedPos =
              characterRef.current.getLastCollectedCoinPosition();

            // If we have a last collected position, find its index in the path
            let pathToUse = workExperiencePath;
            if (lastCollectedPos) {
              const lastCollectedIndex = workExperiencePath.findIndex(
                (waypoint) => waypoint.distanceTo(lastCollectedPos) < 0.1
              );
              if (lastCollectedIndex !== -1) {
                // Start from the next waypoint after the last collected coin
                pathToUse = workExperiencePath.slice(lastCollectedIndex + 1);
              }
            }

            // If no last collected position or not found in path, start from current position
            if (pathToUse === workExperiencePath) {
              pathToUse = [
                currentPos.distanceTo(startPos) <= 2
                  ? currentPos
                  : new THREE.Vector3(...startingPosition),
                ...workExperiencePath,
              ];
            }

            characterRef.current.moveToPosition(
              new THREE.Vector3(...workExperiencePosition),
              () => {
                onWorkExperienceChange(true);
                setTargetSection(null);
                setIsAutomaticMode(false);
              },
              pathToUse
            );
          }
        }
      },
      moveToProjects: () => {
        if (characterRef.current) {
          if (visitedAreas.projects) {
            onProjectsChange(true);
            return;
          }
          setIsAutomaticMode(true);
          setTargetSection("projects");
          if (isInProjectsZone) {
            onProjectsChange(true);
          } else {
            const currentPos = characterRef.current.getCurrentPosition();
            const startPos = new THREE.Vector3(...startingPosition);
            const lastCollectedPos =
              characterRef.current.getLastCollectedCoinPosition();

            // If we have a last collected position, find its index in the path
            let pathToUse = projectsPath;
            if (lastCollectedPos) {
              const lastCollectedIndex = projectsPath.findIndex(
                (waypoint) => waypoint.distanceTo(lastCollectedPos) < 0.1
              );
              if (lastCollectedIndex !== -1) {
                // Start from the next waypoint after the last collected coin
                pathToUse = projectsPath.slice(lastCollectedIndex + 1);
              }
            }

            // If no last collected position or not found in path, start from current position
            if (pathToUse === projectsPath) {
              pathToUse = [
                currentPos.distanceTo(startPos) <= 2
                  ? currentPos
                  : new THREE.Vector3(...startingPosition),
                ...projectsPath,
              ];
            }

            characterRef.current.moveToPosition(
              new THREE.Vector3(...projectsPosition),
              () => {
                onProjectsChange(true);
                setTargetSection(null);
                setIsAutomaticMode(false);
              },
              pathToUse
            );
          }
        }
      },
      moveToContact: () => {
        if (characterRef.current) {
          if (visitedAreas.contact) {
            onContactChange(true);
            return;
          }
          setIsAutomaticMode(true);
          setTargetSection("contact");
          if (isInContactZone) {
            onContactChange(true);
          } else {
            const currentPos = characterRef.current.getCurrentPosition();
            const startPos = new THREE.Vector3(...startingPosition);
            const lastCollectedPos =
              characterRef.current.getLastCollectedCoinPosition();

            // If we have a last collected position, find its index in the path
            let pathToUse = contactPath;
            if (lastCollectedPos) {
              const lastCollectedIndex = contactPath.findIndex(
                (waypoint) => waypoint.distanceTo(lastCollectedPos) < 0.1
              );
              if (lastCollectedIndex !== -1) {
                // Start from the next waypoint after the last collected coin
                pathToUse = contactPath.slice(lastCollectedIndex + 1);
              }
            }

            // If no last collected position or not found in path, start from current position
            if (pathToUse === contactPath) {
              pathToUse = [
                currentPos.distanceTo(startPos) <= 2
                  ? currentPos
                  : new THREE.Vector3(...startingPosition),
                ...contactPath,
              ];
            }

            characterRef.current.moveToPosition(
              new THREE.Vector3(...contactPosition),
              () => {
                onContactChange(true);
                setTargetSection(null);
                setIsAutomaticMode(false);
              },
              pathToUse
            );
          }
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

        <MessageSign
          position={[22, 40, 88]}
          scale={1}
          width={10}
          height={3}
          rotation={[0, Math.PI + 1.1, 0]}
          topText="WORK"
          bottomText="EXPERIENCE"
          showPost={false}
        />

        <MessageSign
          position={[16, 36, 71.5]}
          scale={1}
          width={10}
          height={3}
          rotation={[0, Math.PI * 2, 0]}
          topText="WORK"
          bottomText="EXPERIENCE"
          showPost
        />

        <MessageSign
          position={[15, 60, 50]}
          scale={1}
          width={10}
          height={3}
          rotation={[0, Math.PI * 2, 0]}
          topText="PROJECTS"
          bottomText=""
          showPost
        />
        <MessageSign
          position={[22, 62, 78]}
          scale={1}
          width={10}
          height={3}
          rotation={[0, Math.PI + 1.1, 0]}
          topText="PROJECTS"
          bottomText=""
          showPost={false}
        />

        <MessageSign
          position={[-4, 70, 47]}
          scale={1}
          width={10}
          height={3}
          rotation={[0, -(Math.PI / 2) + 0.5, 0]}
          topText="CONTACT"
          bottomText="ME"
          showPost={false}
        />

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
          <Map scale={1} position={[0, 0, 0]} />
          <CharacterController
            ref={characterRef}
            isAutomaticMode={isAutomaticMode}
          />
          <Coins />

          {/* Work Experience Trigger Area */}
          <WorkExperienceTrigger
            position={workExperiencePosition}
            size={[20, 12, 20]}
            onEnter={() => {
              console.log("Entered work experience area");
              setIsInWorkExperienceZone(true);
              setVisitedAreas((prev) => ({ ...prev, workExperience: true }));
              if (!isAutomaticMode || targetSection === "workExperience") {
                onWorkExperienceChange(true);
              }
            }}
            onExit={() => {
              console.log("Exited work experience area");
              setIsInWorkExperienceZone(false);
              onWorkExperienceChange(false);
            }}
          />

          {/* Projects Trigger Area */}
          <ProjectTrigger
            position={projectsPosition}
            size={[20, 8, 25]}
            onEnter={() => {
              console.log("Entered projects area");
              setIsInProjectsZone(true);
              setVisitedAreas((prev) => ({ ...prev, projects: true }));
              if (!isAutomaticMode || targetSection === "projects") {
                onProjectsChange(true);
              }
            }}
            onExit={() => {
              console.log("Exited projects area");
              setIsInProjectsZone(false);
              onProjectsChange(false);
            }}
          />

          {/* Contact Trigger Area */}
          <ContactMeTrigger
            position={contactPosition}
            size={[10, 10, 10]}
            onEnter={() => {
              console.log("Entered contact area");
              setIsInContactZone(true);
              setVisitedAreas((prev) => ({ ...prev, contact: true }));
              if (!isAutomaticMode || targetSection === "contact") {
                onContactChange(true);
              }
            }}
            onExit={() => {
              console.log("Exited contact area");
              setIsInContactZone(false);
              onContactChange(false);
            }}
          />
        </Physics>
      </>
    );
  }
);

export default Experience;
