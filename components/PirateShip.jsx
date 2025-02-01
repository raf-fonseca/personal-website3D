"use client";
import { useRef } from "react";
import { useGLTF } from "@react-three/drei";

export function PirateShip(props) {
  const { scene } = useGLTF("/Pirate Ship 3D Model.glb");
  const shipRef = useRef();

  // Enable shadows for the ship
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

  return (
    <group ref={shipRef} {...props}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/Pirate Ship 3D Model.glb");
