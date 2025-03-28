"use client";
import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export const Map = ({ ...props }) => {
  const { scene } = useGLTF("/3D/Island3D.glb");
  const group = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Replace all materials with MeshLambertMaterial
        const originalMaterial = child.material;
        const lambertMaterial = new THREE.MeshLambertMaterial({
          map: originalMaterial.map,
          color: originalMaterial.color,
          transparent: originalMaterial.transparent,
          opacity: originalMaterial.opacity,
          side: originalMaterial.side,
        });

        child.material = lambertMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group>
      <RigidBody type="fixed" colliders="trimesh">
        <primitive object={scene} {...props} ref={group} />
      </RigidBody>
    </group>
  );
};
