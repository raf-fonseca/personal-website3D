"use client";
import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export function Robot({
  isIslandAnimationComplete,
  setRobotPosition,
  ...props
}) {
  const group = useRef();
  const { scene, animations } = useGLTF("/robot.glb");
  const { actions } = useAnimations(animations, group);
  const positionZ = useRef(0.6);
  const moveSpeed = 0.1;
  const rotationProgressRef = useRef(0);

  useFrame(() => {
    if (!isIslandAnimationComplete) {
      if (rotationProgressRef.current < Math.PI * 2) {
        // Calculate new position around the circle
        const radius = 0.6; // Distance from center
        const angle = rotationProgressRef.current;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;

        // Update position and face center
        group.current.position.x = x;
        group.current.position.z = z;
        group.current.rotation.y = angle + Math.PI; // Keep facing center

        rotationProgressRef.current += 0.07;
      }
    }
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isIslandAnimationComplete) return;

      switch (event.key) {
        case "ArrowUp":
          positionZ.current -= moveSpeed;
          break;
        case "ArrowDown":
          positionZ.current += moveSpeed;
          break;
      }
      setRobotPosition([0, -0.35, positionZ.current]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isIslandAnimationComplete, setRobotPosition]);

  scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material) {
        child.material.roughness = 0.4;
        child.material.metalness = 0.6;
        child.material.emissive.set("#ffffff");
        child.material.emissiveIntensity = 0.2;
      }
    }
  });

  useEffect(() => {
    const animation = actions["Take 001"];
    if (animation) {
      animation.reset().play();
      animation.setLoop(true, Infinity);
    }
  }, [actions]);

  return (
    <group ref={group} {...props} position={[0, -0.35, positionZ.current]}>
      <primitive object={scene} rotation={[0, Math.PI, 0]} />
    </group>
  );
}

useGLTF.preload("/robot.glb");
