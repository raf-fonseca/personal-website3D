"use client";
import { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useSpring, animated } from "@react-spring/three";
import { JourneySteps } from "@/app/page";

export function Robot({
  islandAnimationComplete,
  setRobotPosition,
  currentStep,
  onMovementComplete,
  ...props
}) {
  const group = useRef();
  const { scene, animations } = useGLTF("/3D/robot.glb");
  const { actions } = useAnimations(animations, group);
  const rotationProgressRef = useRef(0);
  const isMovingForward = useRef(false);
  const [movementPhase, setMovementPhase] = useState("initial");
  const initialY = -0.35;
  const targetY = 0.1; // Higher position

  // Spring for smooth rotation and tilt
  const { rotation } = useSpring({
    rotation: [
      isMovingForward.current ? 0.2 : 0, // X-axis tilt
      movementPhase === "initial"
        ? Math.PI // Initial position
        : movementPhase === "movingUp"
        ? rotationProgressRef.current * 0.5 // Continuous rotation
        : movementPhase === "turningBack"
        ? Math.PI * 2 // Final angle - you can adjust this multiplier
        : 0,
      0,
    ],
    config: { mass: 1, tension: 180, friction: 12 },
  });

  // Add this to track current position
  const currentPosition = useRef({ x: 0, y: initialY, z: 0 });

  useEffect(() => {
    if (currentStep !== JourneySteps.IDLE && movementPhase === "initial") {
      // Start movement after a small delay when entering a new step
      setTimeout(() => {
        setMovementPhase("movingUp");
        isMovingForward.current = true;
        rotationProgressRef.current = 0;
      }, 500);
    }
  }, [currentStep, movementPhase]);

  useFrame(() => {
    if (!islandAnimationComplete) {
      // Initial circular movement
      if (rotationProgressRef.current < Math.PI * 2) {
        const radius = 0.45;
        const angle = rotationProgressRef.current;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        // Update position and notify Island component
        currentPosition.current = { x, y: initialY, z };
        group.current.position.x = x;
        group.current.position.z = z;
        group.current.position.y = initialY;
        group.current.rotation.y = angle + Math.PI;

        // Send position to Island
        setRobotPosition([x, initialY, z]);

        rotationProgressRef.current += 0.07;
      }
    } else if (movementPhase === "movingUp") {
      // Game started movement
      rotationProgressRef.current += 0.02;

      const radius = 0.45;
      const x = Math.sin(rotationProgressRef.current) * radius;
      const z = Math.cos(rotationProgressRef.current) * radius;

      const progress = Math.min(rotationProgressRef.current / (Math.PI * 2), 1);
      const y = initialY + (targetY - initialY) * progress;

      currentPosition.current = { x, y, z };
      group.current.position.set(x, y, z);
      setRobotPosition([x, y, z]);

      if (rotationProgressRef.current >= Math.PI) {
        setMovementPhase("turningBack");
        isMovingForward.current = false;
        onMovementComplete(); // Signal that movement is complete
      }
    }
  });

  // Animation setup
  useEffect(() => {
    const animation = actions["Take 001"];
    if (animation) {
      animation.reset().play();
      animation.setLoop(true, Infinity);
    }
  }, [actions]);

  return (
    <animated.group ref={group} {...props} rotation={rotation}>
      <primitive object={scene} rotation={[0, Math.PI, 0]} />
    </animated.group>
  );
}

useGLTF.preload("/3D/robot.glb");
