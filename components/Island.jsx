"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { a } from "@react-spring/three";

export function Island(props) {
  const { scene } = useGLTF("/Cartoon Sea Village 3D Model.glb");
  const islandRef = useRef();

  return (
    <a.group ref={islandRef} {...props}>
      <primitive object={scene} scale={0.01} position={[0, -2, 0]} />
    </a.group>
  );
}

useGLTF.preload("/Cartoon Sea Village 3D Model.glb");
