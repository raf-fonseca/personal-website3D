"use client";
import { useRef, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { a } from "@react-spring/three";
import * as THREE from "three";

export function Island({
  setCurrentStage,
  setIsLoading,
  setIslandAnimationComplete,
  gameStarted,
  robotPosition,
  ...props
}) {
  const { scene } = useGLTF("/Fantasy Island 3D Model.glb");
  const { gl, camera } = useThree();
  const islandRef = useRef();
  const rotationProgressRef = useRef(0);
  const [isZooming, setIsZooming] = useState(true);
  const [isSpinning, setIsSpinning] = useState(true);
  const initialCameraPosition = useRef([0, 5, 10]);
  const targetCameraPosition = useRef([0, -0.2, 1]);
  const initialCameraRotation = useRef(-Math.PI / 3);
  const targetCameraRotation = useRef(0);
  const cameraOffset = useRef({ x: 0, y: 0.5, z: 2 });
  const islandRotationRef = useRef(Math.PI); // Initial rotation

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

      // Check if final camera movement is complete
      if (!isSpinning && Math.abs(dz - 1.5) < 0.1 && Math.abs(dy + 0.5) < 0.1) {
        setIsZooming(false);
      }
      return;
    }
  });

  // Island rotation and camera following
  useFrame(() => {
    if (gameStarted) {
      const [robotX, robotY, robotZ] = robotPosition;

      // Camera settings
      const cameraDistance = 0.3;
      const cameraHeight = 0.4;
      const cameraLag = 0.08;

      // Calculate camera position behind and above robot
      const targetCameraX = robotX;
      const targetCameraY = robotY + cameraHeight;
      const targetCameraZ = robotZ + cameraDistance;

      // Smooth camera movement
      camera.position.x += (targetCameraX - camera.position.x) * cameraLag;
      camera.position.y += (targetCameraY - camera.position.y) * cameraLag;
      camera.position.z += (targetCameraZ - camera.position.z) * cameraLag;

      // Make camera look at robot
      camera.lookAt(robotX, robotY + 0.1, robotZ);

      // Rotate island with robot's movement
      const rotationSpeed = 0.02; // Match with robot's rotation speed
      // islandRef.current.rotation.y += rotationSpeed;
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

useGLTF.preload("/Fantasy Island 3D Model.glb");
