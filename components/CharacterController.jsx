"use client";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { MathUtils, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { Character } from "./Character";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = () => {
  // Fixed values instead of controls
  const FLIGHT_SPEED = 30;
  const VERTICAL_SPEED = 20;
  const ROTATION_SPEED = degToRad(30);
  const TILT_ANGLE = degToRad(15);
  const TILT_SPEED = 0.1;
  const MOVEMENT_SMOOTHING = 0.05;
  const ROTATION_SMOOTHING = 0.08;

  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const targetTiltRef = useRef(0);

  // Target velocity for smooth transitions
  const targetVelocity = useRef(new Vector3(0, 0, 0));
  const currentVelocity = useRef(new Vector3(0, 0, 0));

  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(0);
  const cameraTarget = useRef();
  const cameraPosition = useRef();
  const cameraWorldPosition = useRef(new Vector3());
  const cameraLookAtWorldPosition = useRef(new Vector3());
  const cameraLookAt = useRef(new Vector3());
  const [, get] = useKeyboardControls();

  useFrame(({ camera }) => {
    if (rb.current) {
      // Separate horizontal and vertical movement
      const horizontalMovement = {
        x: 0,
        z: 0,
      };

      const verticalMovement = {
        y: 0,
      };

      // Forward/backward movement
      if (get().forward) {
        horizontalMovement.z = 1;
      }
      if (get().backward) {
        horizontalMovement.z = -1;
      }

      // Vertical movement (flying up/down)
      if (get().up) {
        verticalMovement.y = 1;
      }
      if (get().down) {
        verticalMovement.y = -1;
      }

      let speed = FLIGHT_SPEED;

      if (get().left) {
        horizontalMovement.x = 1;
      }
      if (get().right) {
        horizontalMovement.x = -1;
      }

      // Smooth rotation changes
      if (horizontalMovement.x !== 0) {
        rotationTarget.current = MathUtils.lerp(
          rotationTarget.current,
          rotationTarget.current + ROTATION_SPEED * horizontalMovement.x,
          ROTATION_SMOOTHING
        );
      }

      // Check if character is moving horizontally
      const isHorizontallyMoving =
        horizontalMovement.x !== 0 || horizontalMovement.z !== 0;

      // Check if character is moving at all
      const isCurrentlyMoving =
        isHorizontallyMoving || verticalMovement.y !== 0;

      // Set target tilt based on horizontal movement only
      targetTiltRef.current = isHorizontallyMoving ? TILT_ANGLE : 0;

      // Apply tilt to character model with smooth transition
      if (character.current) {
        character.current.rotation.x = MathUtils.lerp(
          character.current.rotation.x,
          targetTiltRef.current,
          TILT_SPEED
        );
      }

      // Calculate target velocity
      if (isCurrentlyMoving) {
        // Only update character rotation if moving horizontally
        if (isHorizontallyMoving) {
          characterRotationTarget.current = Math.atan2(
            horizontalMovement.x,
            horizontalMovement.z
          );

          // Set horizontal target velocity
          targetVelocity.current.x =
            Math.sin(rotationTarget.current + characterRotationTarget.current) *
            speed;
          targetVelocity.current.z =
            Math.cos(rotationTarget.current + characterRotationTarget.current) *
            speed;
        } else {
          // If only moving vertically, maintain current horizontal velocity
          // but gradually reduce it for a smooth stop
          targetVelocity.current.x *= 0.95;
          targetVelocity.current.z *= 0.95;
        }

        // Set vertical velocity directly
        targetVelocity.current.y = verticalMovement.y * VERTICAL_SPEED;
      } else {
        // When not moving, gradually slow down to zero
        targetVelocity.current.set(0, 0, 0);
      }

      // Smoothly interpolate current velocity towards target velocity
      currentVelocity.current.lerp(targetVelocity.current, MOVEMENT_SMOOTHING);

      // Apply the smoothed velocity
      rb.current.setLinvel(
        {
          x: currentVelocity.current.x,
          y: currentVelocity.current.y,
          z: currentVelocity.current.z,
        },
        true
      );

      // Smooth character rotation - only update if moving horizontally
      if (isHorizontallyMoving) {
        character.current.rotation.y = lerpAngle(
          character.current.rotation.y,
          characterRotationTarget.current,
          ROTATION_SMOOTHING
        );
      }
    }

    // CAMERA - smooth camera movement
    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current,
      ROTATION_SMOOTHING
    );

    cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
    camera.position.lerp(cameraWorldPosition.current, MOVEMENT_SMOOTHING);

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
      cameraLookAt.current.lerp(
        cameraLookAtWorldPosition.current,
        MOVEMENT_SMOOTHING
      );

      camera.lookAt(cameraLookAt.current);
    }
  });

  return (
    <RigidBody
      name="character"
      colliders={false}
      lockRotations
      ref={rb}
      position={[0, 10, 0]}
      gravityScale={0}
      type="dynamic"
      linearDamping={0.95}
      angularDamping={0.95}
    >
      <group ref={container}>
        <group ref={cameraTarget} position-z={50} />
        <group ref={cameraPosition} position-y={30} position-z={-50} />
        <group ref={character}>
          <Character position={[0, 5, 0]} rotation={[0, 0, 0]} scale={12} />
        </group>
      </group>
      <CapsuleCollider args={[1.8, 1.8]} position={[0, 8, 0]} />
    </RigidBody>
  );
};

export default CharacterController;
