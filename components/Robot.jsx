"use client";
import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { RectAreaLight } from "three";

export function Robot(props) {
  const group = useRef();
  const { scene, animations } = useGLTF("/robot.glb");
  const { actions } = useAnimations(animations, group);

  // Enable shadows and adjust materials for the robot
  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.roughness = 0.4; // Reduced roughness for more shine
        child.material.metalness = 0.6; // Increased metalness
        child.material.emissive.set("#ffffff"); // Add slight glow
        child.material.emissiveIntensity = 0.2; // Control glow intensity
      }
    }
  });

  useEffect(() => {
    const robotLight = new RectAreaLight("#ffffff", 0.3, 1, 1);
    robotLight.position.set(0, 0.5, 0.5);
    robotLight.lookAt(0, 0, 0);
    group.current.add(robotLight);

    return () => {
      group.current.remove(robotLight);
    };
  }, []);

  // Play animation on load
  useEffect(() => {
    console.log("Available animations:", Object.keys(actions));

    const animation = actions["Take 001"];
    if (animation) {
      animation.reset().play();
      animation.setLoop(true, Infinity); // Make it loop infinitely
    }
  }, [actions]);

  return (
    <group ref={group} {...props}>
      <primitive object={scene} rotation={[0, Math.PI, 0]} />
    </group>
  );
}

useGLTF.preload("/robot.glb");
