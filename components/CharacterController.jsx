"use client";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
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

export const CharacterController = forwardRef((props, ref) => {
  // Fixed values instead of controls
  const FLIGHT_SPEED = 40;
  const VERTICAL_SPEED = 20;
  const ROTATION_SPEED = degToRad(50.107);
  const TILT_ANGLE = degToRad(15);
  const TILT_SPEED = 0.1;
  const MOVEMENT_SMOOTHING = 0.05;
  const ROTATION_SMOOTHING = 0.08;

  const rb = useRef();
  const container = useRef();
  const character = useRef();
  const [isMovingToTarget, setIsMovingToTarget] = useState(false);
  const targetPosition = useRef(null);
  const onReachTarget = useRef(null);

  const targetTiltRef = useRef(0);
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

  const [fadeOpacity, setFadeOpacity] = useState(0);
  const fadeTimeout = useRef(null);

  // Expose moveToPosition method
  useImperativeHandle(ref, () => ({
    moveToPosition: (position, callback) => {
      if (rb.current) {
        // Start fade out
        setFadeOpacity(1);

        // Wait for fade out, then teleport
        fadeTimeout.current = setTimeout(() => {
          // Directly set the position
          rb.current.setTranslation(position, true);

          // Calculate direction to center (0,0,0)
          const directionToCenter = new Vector3(0, 0, 0).sub(
            new Vector3(...position)
          );
          const angle = Math.atan2(directionToCenter.x, directionToCenter.z);

          // Set the character and container rotation to face center
          if (character.current) {
            character.current.rotation.y = angle;
            characterRotationTarget.current = angle;
          }
          container.current.rotation.y = angle;
          rotationTarget.current = angle;

          // Start fade in
          setTimeout(() => {
            setFadeOpacity(0);
            // Call the callback after fade in starts
            if (callback) callback();
          }, 300);
        }, 300);
      }
    },
  }));

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeout.current) {
        clearTimeout(fadeTimeout.current);
      }
    };
  }, []);

  useFrame(({ camera }) => {
    if (rb.current) {
      let horizontalMovement = { x: 0, z: 0 };
      let verticalMovement = { y: 0 };
      let speed = FLIGHT_SPEED;

      // Normal keyboard controls
      if (get().forward) horizontalMovement.z = 1;
      if (get().backward) horizontalMovement.z = -1;
      if (get().left) horizontalMovement.x = 1;
      if (get().right) horizontalMovement.x = -1;
      if (get().up) verticalMovement.y = 1;
      if (get().down) verticalMovement.y = -1;

      // Rest of the movement code for manual control remains the same...
      if (horizontalMovement.x !== 0) {
        rotationTarget.current = MathUtils.lerp(
          rotationTarget.current,
          rotationTarget.current + ROTATION_SPEED * horizontalMovement.x,
          ROTATION_SMOOTHING
        );
      }

      const isHorizontallyMoving =
        horizontalMovement.x !== 0 || horizontalMovement.z !== 0;
      const isCurrentlyMoving =
        isHorizontallyMoving || verticalMovement.y !== 0;

      targetTiltRef.current = isHorizontallyMoving ? TILT_ANGLE : 0;

      if (character.current) {
        character.current.rotation.x = MathUtils.lerp(
          character.current.rotation.x,
          targetTiltRef.current,
          TILT_SPEED
        );
      }

      if (isCurrentlyMoving) {
        if (isHorizontallyMoving) {
          characterRotationTarget.current = Math.atan2(
            horizontalMovement.x,
            horizontalMovement.z
          );

          targetVelocity.current.x =
            Math.sin(rotationTarget.current + characterRotationTarget.current) *
            speed;
          targetVelocity.current.z =
            Math.cos(rotationTarget.current + characterRotationTarget.current) *
            speed;
        } else {
          targetVelocity.current.x *= 0.95;
          targetVelocity.current.z *= 0.95;
        }

        targetVelocity.current.y = verticalMovement.y * VERTICAL_SPEED;
      } else {
        targetVelocity.current.set(0, 0, 0);
      }

      currentVelocity.current.lerp(targetVelocity.current, MOVEMENT_SMOOTHING);

      rb.current.setLinvel(
        {
          x: currentVelocity.current.x,
          y: currentVelocity.current.y,
          z: currentVelocity.current.z,
        },
        true
      );

      if (isHorizontallyMoving) {
        character.current.rotation.y = lerpAngle(
          character.current.rotation.y,
          characterRotationTarget.current,
          ROTATION_SMOOTHING
        );
      }
    }

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
    <>
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
          <group ref={cameraTarget} position-z={5.5} />
          <group ref={cameraPosition} position-y={30} position-z={-50} />
          <group ref={character}>
            <Character position={[0, 0, 0]} rotation={[0, 0, 0]} scale={12} />
          </group>
        </group>
        <CapsuleCollider args={[1.8, 1.8]} position={[0, 3, 0]} />
      </RigidBody>

      {/* White overlay for fade transition */}
      <mesh position={[0, 0, 0]} renderOrder={1000}>
        <planeGeometry args={[100000, 100000]} />
        <meshBasicMaterial
          transparent
          opacity={fadeOpacity}
          color="white"
          depthTest={false}
        />
      </mesh>
    </>
  );
});

export default CharacterController;
