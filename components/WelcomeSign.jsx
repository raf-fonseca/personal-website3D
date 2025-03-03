"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

export function WelcomeSign({
  position = [0, 0, 0],
  scale = 1, // Base scale factor
  width = 8, // Base width of the sign
  height = 2.5, // Base height of the sign
}) {
  const signRef = useRef();
  const arrowRef = useRef();

  // Derived measurements based on scale
  const postWidth = 0.4 * scale;
  const postHeight = 5 * scale;
  const boardWidth = width * scale;
  const boardHeight = height * scale;
  const boardThickness = 0.3 * scale;
  const textSize = 0.8 * scale;

  return (
    <group ref={signRef} position={position} rotation={[0, Math.PI + 0.3, 0]}>
      {/* Wooden post */}
      <mesh castShadow position={[0, 0, 0]}>
        <boxGeometry args={[postWidth, postHeight * 1.955, postWidth]} />
        <meshStandardMaterial color="#8B4513" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Sign board */}
      <group
        position={[boardWidth * 0.5, postHeight * 0.6, 0]}
        rotation={[0, 0, 0]}
      >
        {/* Main board */}
        <mesh castShadow receiveShadow>
          <boxGeometry
            args={[boardWidth * 1.01, boardHeight * 1.25, boardThickness]}
          />
          <meshStandardMaterial
            color="#8B4513"
            roughness={0.9}
            metalness={0.1}
            envMapIntensity={0.5}
          />
        </mesh>

        {/* Text background plate for better visibility */}
        <mesh position={[0, 0, boardThickness / 2 + 0.01]}>
          <boxGeometry
            args={[boardWidth * 0.97, boardHeight * 1.1, 0.02 * scale]}
          />
          <meshStandardMaterial
            color="#4a3728"
            roughness={0.7}
            metalness={0.2}
          />
        </mesh>

        {/* Text */}
        <Center position={[-3, boardHeight * 0.16, boardThickness / 2 + 0.05]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={textSize}
            height={0.2 * scale}
            curveSegments={12}
          >
            FOLLOW
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FFFFFF"
              emissiveIntensity={0.2}
              metalness={0.4}
              roughness={0.3}
            />
          </Text3D>
        </Center>

        <Center position={[-3, -boardHeight * 0.24, boardThickness / 2 + 0.05]}>
          <Text3D
            font="/fonts/helvetiker_regular.typeface.json"
            size={textSize}
            height={0.2 * scale}
            curveSegments={12}
          >
            THE TRAIL
            <meshStandardMaterial
              color="#FFFFFF"
              emissive="#FFFFFF"
              emissiveIntensity={0.2}
              metalness={0.4}
              roughness={0.3}
            />
          </Text3D>
        </Center>

        {/* Arrow */}
        <group position={[boardWidth * 0.25, 0, boardThickness / 2 + 0.03]}>
          <group ref={arrowRef}>
            {/* Arrow body */}
            <mesh>
              <boxGeometry args={[2 * scale, 0.4 * scale, 0.15 * scale]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={0.5}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
            {/* Arrow head */}
            <mesh
              position={[1.2 * scale, 0, 0]}
              rotation={[0, 0, -Math.PI / 2]}
            >
              <cylinderGeometry args={[0, 0.4 * scale, 0.8 * scale, 4]} />
              <meshStandardMaterial
                color="#FFFFFF"
                emissive="#FFFFFF"
                emissiveIntensity={0.5}
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
          </group>
        </group>

        {/* Decorative nails at corners */}
        {[
          [-boardWidth * 0.49, boardHeight * 0.58],
          [-boardWidth * 0.49, -boardHeight * 0.58],
          [boardWidth * 0.49, boardHeight * 0.58],
          [boardWidth * 0.49, -boardHeight * 0.58],
        ].map((pos, i) => (
          <mesh key={i} position={[pos[0], pos[1], boardThickness / 2]}>
            <cylinderGeometry
              args={[0.12 * scale, 0.12 * scale, 0.2 * scale, 8]}
            />
            <meshStandardMaterial
              color="#696969"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default WelcomeSign;
