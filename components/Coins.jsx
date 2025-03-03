"use client";
import { useAnimations, useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useCoins } from "../contexts/CoinContext";

// Load the coin model once
const CoinModel = () => {
  const { scene, animations } = useGLTF("/3D/Coin.glb");
  return { scene, animations };
};

// Single coin component
const Coin = ({
  position,
  scale = 0.1,
  rotation = [0, 0, 0],
  collected,
  id,
}) => {
  // Get the original model
  const { scene: originalScene, animations } = useMemo(() => CoinModel(), []);

  // Create a deep clone of the scene with its own materials
  const coinScene = useMemo(() => {
    const clonedScene = originalScene.clone(true);

    // Ensure each mesh has its own material instance
    clonedScene.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return clonedScene;
  }, [originalScene]);

  const group = useRef();
  const { actions } = useAnimations(animations, group);
  const [animationProgress, setAnimationProgress] = useState(0);
  const spinSpeed = useRef(1);
  const isCollected = useRef(false);

  // Update isCollected ref when collected prop changes
  useEffect(() => {
    if (collected && !isCollected.current) {
      isCollected.current = true;
    }
  }, [collected]);

  // Normal spinning animation
  useEffect(() => {
    const animation = actions["CoinObj|Coin"];
    if (animation) {
      animation.reset().play();
      animation.setLoop(true, Infinity);
      animation.setEffectiveTimeScale(1);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [actions]);

  // Collection animation
  useFrame((state, delta) => {
    if (isCollected.current) {
      // Increase animation progress
      setAnimationProgress((prev) => Math.min(prev + delta * 2, 1));

      // Increase spin speed
      spinSpeed.current = 1 + animationProgress * 5;

      // Apply spin speed to animation
      const animation = actions["CoinObj|Coin"];
      if (animation) {
        animation.setEffectiveTimeScale(spinSpeed.current);
      }

      // Move upward
      if (group.current) {
        // Move up by 10 units over the animation duration
        group.current.position.y = animationProgress * 10;

        // Fade out - apply to each mesh individually
        coinScene.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = 1 - animationProgress;
            child.material.transparent = true;
          }
        });
      }
    }
  });

  return (
    <group
      position={position}
      ref={group}
      visible={animationProgress < 1 || !isCollected.current}
    >
      <primitive object={coinScene} scale={scale} rotation={rotation} />
    </group>
  );
};

// Main component to manage multiple coins
export const Coins = () => {
  const { collectedCoins, collectCoin } = useCoins();

  // Predefined coin positions
  const coinPositions = [
    [-3.832, 23.786, 15.436],
    [-20.832, 26.786, 30.436],
    [-25.832, 30.786, 45.436],
    [-20.832, 31.786, 65.436],
    [-5.832, 33.786, 80.436],
    [13.832, 35.786, 80.436],
    [30, 35.786, 70.436],
    [35, 38.786, 50.436],
    [25, 40.786, 30.436],
    [5, 40.786, 25.436],
    [-9, 43.786, 28.436],
    [-17, 45.786, 45.436],
    [-17, 48.786, 60.436],
    [-5, 48.786, 70.436],
    [20, 53.786, 65.436],
    [25, 53.786, 50.436],
    [12, 53.786, 35.436],
    [-10, 53.786, 40.436],
    [-10, 55.786, 55.436],
    [-3, 63.786, 51.436],
  ];

  return (
    <group>
      {coinPositions.map((position, index) => {
        const isCollected = collectedCoins.includes(index);

        return (
          <RigidBody
            key={index}
            type="fixed"
            colliders="cuboid"
            position={position}
            sensor
            onIntersectionEnter={(e) => {
              // Check if the intersecting body is the character
              if (
                e.other.rigidBodyObject?.name === "character" &&
                !isCollected
              ) {
                collectCoin(index);
              }
            }}
          >
            <Coin id={index} collected={isCollected} />
          </RigidBody>
        );
      })}
    </group>
  );
};

// Preload the coin model to improve performance
useGLTF.preload("/3D/Coin.glb");

export default Coins;
