"use client";
import React, { useRef } from "react";
import { Environment, OrthographicCamera } from "@react-three/drei";
import { Map } from "./Map";
import { Physics } from "@react-three/rapier";
import { CharacterController } from "./CharacterController";
import { Coins } from "./Coins";

// Define maps configuration

export const Experience = () => {
  const shadowCameraRef = useRef();

  return (
    <>
      <Environment preset="sunset" intensity={0.3} />
      <directionalLight
        intensity={0.9}
        castShadow
        position={[-15, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight>
      <ambientLight intensity={0.9} />
      <Physics debug={false}>
        <Map scale={1} position={[0, 0, 50]} />
        <CharacterController />
        <Coins />
      </Physics>
    </>
  );
};

export default Experience;
