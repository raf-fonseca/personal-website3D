"use client";
import { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { a } from "@react-spring/three";

export function Island({
  isRotating,
  setIsRotating,
  setCurrentStage,
  setIsLoading,
  ...props
}) {
  const { scene } = useGLTF("/Fantasy Island 3D Model.glb");
  const { gl, viewport } = useThree();
  const islandRef = useRef();

  const lastX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.95;

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

  const handlePointerDown = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(true);

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    lastX.current = clientX;
  };

  const handlePointerUp = (event) => {
    event.stopPropagation();
    event.preventDefault();
    setIsRotating(false);
  };

  const handlePointerMove = (event) => {
    event.stopPropagation();
    event.preventDefault();

    if (isRotating) {
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const delta = (clientX - lastX.current) / viewport.width;

      islandRef.current.rotation.y += delta * 0.01 * Math.PI;
      lastX.current = clientX;
      rotationSpeed.current = delta * 0.01 * Math.PI;
    }
  };

  const handleKeyDown = (event) => {
    const rotationIncrement = 0.01;
    if (event.key === "ArrowLeft") {
      if (!isRotating) setIsRotating(true);
      islandRef.current.rotation.y += rotationIncrement;
    } else if (event.key === "ArrowRight") {
      if (!isRotating) setIsRotating(true);
      islandRef.current.rotation.y -= rotationIncrement;
    }
  };

  const handleKeyUp = (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      setIsRotating(false);
    }
  };

  useFrame(() => {
    if (!isRotating) {
      rotationSpeed.current *= dampingFactor;

      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      const rotation = islandRef.current.rotation.y;
      const normalizedRotation =
        ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

      // You can adjust these rotation ranges based on your model's orientation
      if (normalizedRotation >= 0 && normalizedRotation < Math.PI / 2) {
        setCurrentStage(2);
      } else if (
        normalizedRotation >= Math.PI / 2 &&
        normalizedRotation < Math.PI
      ) {
        setCurrentStage(3);
      } else if (
        normalizedRotation >= Math.PI &&
        normalizedRotation < (3 * Math.PI) / 2
      ) {
        setCurrentStage(4);
      } else if (
        normalizedRotation >= (3 * Math.PI) / 2 &&
        normalizedRotation <= 2 * Math.PI
      ) {
        setCurrentStage(1);
      }
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl, handlePointerDown, handlePointerUp, handlePointerMove]);

  useEffect(() => {
    // When the scene is loaded
    const handleSceneLoaded = () => {
      setIsLoading(false);
    };

    // Add event listener for when the scene is loaded
    scene.addEventListener("loaded", handleSceneLoaded);

    return () => {
      scene.removeEventListener("loaded", handleSceneLoaded);
    };
  }, [scene, setIsLoading]);

  return (
    <a.group ref={islandRef} {...props}>
      <primitive object={scene} />
    </a.group>
  );
}

useGLTF.preload("/Fantasy Island 3D Model.glb");
