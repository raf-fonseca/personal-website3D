"use client";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";

export const Character = ({ ...props }) => {
  const { scene, animations } = useGLTF("/3D/Robot.glb");
  const group = useRef();
  const { actions } = useAnimations(animations, group);
  // Animation
  useEffect(() => {
    const animation = actions["Take 001"];
    if (animation) {
      animation.reset().play();
      animation.setLoop(true, Infinity);
    }
  }, [actions]);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    <group {...props} ref={group}>
      <primitive object={scene} />
    </group>
  );
};

export default Character;
