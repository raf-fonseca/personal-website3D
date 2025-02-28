"use client";
import { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring, animated, config } from "@react-spring/three";
import { Steps, useStep } from "@/contexts/StepContext";

export function Robot({
  islandAnimationComplete,
  setRobotPosition,
  onWorkExperienceComplete,
  onProjectsComplete,
  ...props
}) {
  const { currentStep } = useStep();
  const { camera } = useThree();
  const group = useRef();
  const { scene, animations } = useGLTF("/3D/robot.glb");
  const { actions } = useAnimations(animations, group);
  const rotationProgressRef = useRef(0);
  const isMovingForward = useRef(false);
  const [movementPhase, setMovementPhase] = useState("initial");
  const [isLoading, setIsLoading] = useState(false);
  const loadingTransitionRef = useRef(0); // For smooth transition
  const initialY = -0.35;
  const targetY = 0.1; // Higher position for work experience
  const projectsTargetY = -0.1; // Lower target for projects phase
  const lastPosition = useRef({ x: 0, y: initialY, z: 0 });

  // Spring for smooth rotation and tilt with better transition
  const { rotation, scale } = useSpring({
    rotation: [
      isMovingForward.current ? 0.2 : 0, // X-axis tilt
      movementPhase === "initial"
        ? Math.PI // Initial position
        : movementPhase === "workExperience"
        ? rotationProgressRef.current * 0.5 // Continuous rotation
        : movementPhase === "projects"
        ? rotationProgressRef.current * 0.9 // Same rotation for projects
        : movementPhase === "turningBack"
        ? Math.PI * 2 // Final angle
        : 0,
      0,
    ],
    scale: isLoading ? [1.05, 1.05, 1.05] : [1, 1, 1],
    config: { mass: 1, tension: 180, friction: 12 },
  });

  // Add this to track current position
  const currentPosition = useRef({ x: 0, y: initialY, z: 0 });

  // Camera following logic
  useFrame(() => {
    if (islandAnimationComplete) {
      const { x, y, z } = currentPosition.current;

      // Fixed camera settings
      const cameraDistance = 0.7; // Distance behind robot
      const cameraHeight = 0.4; // Height above robot
      const cameraLag = 0.1; // Smoothing factor

      // Calculate angle from robot's position to center
      const robotAngle = Math.atan2(x, z) + Math.PI;

      // Calculate camera position directly behind robot
      const targetCameraX = x - Math.sin(robotAngle) * cameraDistance;
      const targetCameraY = y + cameraHeight;
      const targetCameraZ = z - Math.cos(robotAngle) * cameraDistance;

      // Smooth camera movement
      camera.position.x += (targetCameraX - camera.position.x) * cameraLag;
      camera.position.y += (targetCameraY - camera.position.y) * cameraLag;
      camera.position.z += (targetCameraZ - camera.position.z) * cameraLag;

      // Always look at robot's position
      camera.lookAt(x, y + 0.175, z);
    }
  });

  useEffect(() => {
    if (currentStep === Steps.WORK_EXPERIENCE && movementPhase === "initial") {
      // Start loading animation
      setIsLoading(true);
      loadingTransitionRef.current = 0;

      // Start movement after a delay
      setTimeout(() => {
        // Don't immediately stop loading - we'll fade it out in the animation frame
        rotationProgressRef.current = 0;
        setMovementPhase("workExperience");
        isMovingForward.current = true;
      }, 1000); // Longer delay to show the loading animation
    } else if (
      currentStep === Steps.PROJECTS &&
      (movementPhase === "turningBack" || movementPhase === "completed")
    ) {
      // Only restart if we're not already in the completed state
      if (movementPhase !== "completed") {
        // Start loading animation
        setIsLoading(true);
        loadingTransitionRef.current = 0;

        setTimeout(() => {
          // Start from the current position
          rotationProgressRef.current = Math.PI;
          setMovementPhase("projects");
          isMovingForward.current = true;
        }, 1000); // Longer delay to show the loading animation
      }
    }
  }, [currentStep, movementPhase]);

  // Add a floating animation during loading state
  const loadingAnimationRef = useRef(0);

  useFrame((state, delta) => {
    // Handle loading animation with smooth transition
    if (isLoading) {
      // If we're in a movement phase, start transitioning out of loading
      if (movementPhase === "workExperience" || movementPhase === "projects") {
        loadingTransitionRef.current += delta * 2; // Control transition speed
        if (loadingTransitionRef.current >= 1) {
          setIsLoading(false);
          loadingTransitionRef.current = 0;
        }
      }

      // Calculate loading animation intensity based on transition
      const transitionFactor = 1 - Math.min(loadingTransitionRef.current, 1);

      // Instead of bobbing, just move upward by a small amount
      // Start with a small lift that increases over time, then decreases during transition
      const liftProgress = Math.min(loadingAnimationRef.current * 0.5, 1); // Ramp up the lift
      const liftAmount = 0.05 * liftProgress * transitionFactor; // Max lift of 0.05 units

      // Apply the upward motion that fades out during transition
      if (group.current) {
        // Only apply loading animation if not in a movement phase or still transitioning
        if (
          movementPhase === "initial" ||
          movementPhase === "turningBack" ||
          movementPhase === "completed" ||
          transitionFactor > 0
        ) {
          group.current.position.y = currentPosition.current.y + liftAmount;
        }
      }

      // Increment the loading animation timer
      loadingAnimationRef.current += delta * 3;
    }

    if (!islandAnimationComplete) {
      // Initial circular movement
      if (rotationProgressRef.current < Math.PI * 2) {
        const radius = 0.4;
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
    } else if (movementPhase === "workExperience") {
      // Work experience movement
      rotationProgressRef.current += 0.02;

      const radius = 0.4;
      const x = Math.sin(rotationProgressRef.current) * radius;
      const z = Math.cos(rotationProgressRef.current) * radius;

      const progress = Math.min(rotationProgressRef.current / (Math.PI * 2), 1);
      const y = initialY + (targetY - initialY) * progress;

      currentPosition.current = { x, y, z };
      group.current.position.set(x, y, z);
      setRobotPosition([x, y, z]);

      if (rotationProgressRef.current >= Math.PI) {
        // Store the last position before changing phase
        lastPosition.current = { ...currentPosition.current };
        setMovementPhase("turningBack");
        isMovingForward.current = false;
        onWorkExperienceComplete(); // Signal that movement is complete
      }
    } else if (movementPhase === "projects") {
      rotationProgressRef.current += 0.02;
      const radius = 0.4;
      const x = Math.sin(rotationProgressRef.current) * radius;
      const z = Math.cos(rotationProgressRef.current) * radius;
      // Calculate progress for vertical movement
      const progress = Math.min(
        (rotationProgressRef.current - Math.PI) / Math.PI,
        1
      );
      // Start from the last y position of work experience and move toward projects target
      const y =
        lastPosition.current.y +
        (projectsTargetY - lastPosition.current.y) * progress;
      currentPosition.current = { x, y, z };
      group.current.position.set(x, y, z);
      setRobotPosition([x, y, z]);
      if (rotationProgressRef.current >= Math.PI * 2) {
        setMovementPhase("completed");
        isMovingForward.current = false;
        onProjectsComplete(); // Signal that movement is complete
      }
    }
    // No animation updates when movementPhase is "turningBack" or "completed"
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
