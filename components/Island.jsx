"use client";
import { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { a } from "@react-spring/three";
import * as THREE from "three";
import { Steps, useStep } from "@/contexts/StepContext";

export function Island({
  setIsLoading,
  setIslandAnimationComplete,
  robotPosition,
  ...props
}) {
  const { currentStep } = useStep();
  const { scene } = useGLTF("/3D/Fantasy Island 3D Model.glb");
  const { camera } = useThree();
  const islandRef = useRef();
  const rotationProgressRef = useRef(0);
  const [isZooming, setIsZooming] = useState(true);
  const [isSpinning, setIsSpinning] = useState(true);
  const initialCameraPosition = useRef([0, 5, 10]);
  const targetCameraPosition = useRef([0, -0.2, 1.1]);
  const initialCameraRotation = useRef(-Math.PI / 3);
  const targetCameraRotation = useRef(0);

  // Enable shadows for all meshes in the scene
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.roughness = 0.8;
        child.material.metalness = 0.2;
      }
    }
  });

  useFrame(() => {
    if (isZooming) {
      // Camera position interpolation
      const [targetX, targetY, targetZ] = targetCameraPosition.current;
      const [robotX, robotY, robotZ] = robotPosition;

      const dx = targetX - camera.position.x;
      const dy = targetY - camera.position.y;
      const dz = targetZ - camera.position.z;

      // Camera rotation interpolation
      const rotationDiff = targetCameraRotation.current - camera.rotation.x;

      // Smoothly interpolate camera position and rotation
      camera.position.x += dx * 0.05;
      camera.position.y += dy * 0.05;
      camera.position.z += dz * 0.05;
      camera.rotation.x += rotationDiff * 0.05;

      // Only rotate island if we haven't completed a full rotation
      if (rotationProgressRef.current < Math.PI * 2) {
        islandRef.current.rotation.y += 0.07;
        rotationProgressRef.current += 0.07;
      } else if (isSpinning) {
        setIsSpinning(false);
        setIslandAnimationComplete(true);
      }

      // Start transitioning camera look-at after spinning is complete
      if (!isSpinning) {
        const currentTarget = new THREE.Vector3(0, 0, 0);
        camera.getWorldDirection(currentTarget);

        const targetPosition = new THREE.Vector3(robotX, robotY + 0.1, robotZ);
        const cameraPosition = new THREE.Vector3(
          camera.position.x,
          camera.position.y,
          camera.position.z
        );

        // Calculate interpolated look-at position
        targetPosition.sub(cameraPosition).normalize();
        currentTarget.lerp(targetPosition, 0.05);

        // Apply the interpolated look-at
        camera.lookAt(
          camera.position.x + currentTarget.x,
          camera.position.y + currentTarget.y,
          camera.position.z + currentTarget.z
        );
      }

      // Check if final camera movement is complete
      if (!isSpinning && Math.abs(dz - 1.5) < 0.1 && Math.abs(dy + 0.5) < 0.1) {
        setIsZooming(false);
      }
      return;
    }
  });

  // Island rotation and camera following
  useFrame(() => {
    if (currentStep === Steps.WORK_EXPERIENCE) {
      const [robotX, robotY, robotZ] = robotPosition;

      // Camera settings
      const cameraDistance = 1.2;
      const cameraHeight = 0.3;
      const cameraLag = 0.08;

      // Calculate camera position that orbits with the robot
      const robotAngle = Math.atan2(robotX, robotZ);
      const cameraAngle = robotAngle;

      // Calculate camera position in orbit
      const targetCameraX = robotX + Math.sin(cameraAngle) * cameraDistance;
      const targetCameraY = robotY + cameraHeight;
      const targetCameraZ = robotZ + Math.cos(cameraAngle) * cameraDistance;

      // Smooth camera movement
      camera.position.x += (targetCameraX - camera.position.x) * cameraLag;
      camera.position.y += (targetCameraY - camera.position.y) * cameraLag;
      camera.position.z += (targetCameraZ - camera.position.z) * cameraLag;

      // Simple smooth look-at
      const lookAtX = robotX;
      const lookAtY = robotY + 0.1;
      const lookAtZ = robotZ;

      // Create a temporary target vector for smooth interpolation
      const currentLookAt =
        camera.target || new THREE.Vector3(lookAtX, lookAtY, lookAtZ);
      camera.target = camera.target || currentLookAt;

      // Smoothly interpolate the look-at position
      camera.target.x += (lookAtX - camera.target.x) * cameraLag;
      camera.target.y += (lookAtY - camera.target.y) * cameraLag;
      camera.target.z += (lookAtZ - camera.target.z) * cameraLag;

      // Apply the smoothed look-at
      camera.lookAt(camera.target);
    }
  });

  useEffect(() => {
    // When the scene is loaded
    const handleSceneLoaded = () => {
      setIsLoading(false);
    };

    scene.addEventListener("loaded", handleSceneLoaded);
    return () => {
      scene.removeEventListener("loaded", handleSceneLoaded);
    };
  }, [scene, setIsLoading]);

  useEffect(() => {
    // Set initial camera position and rotation
    camera.position.set(...initialCameraPosition.current);
    camera.rotation.set(initialCameraRotation.current, 0, 0);
    camera.lookAt(0, 0, 0);
    islandRef.current.rotation.y = Math.PI;
  }, [camera]);

  return (
    <a.group ref={islandRef} {...props}>
      <primitive object={scene} />
    </a.group>
  );
}

useGLTF.preload("/3D/Fantasy Island 3D Model.glb");
