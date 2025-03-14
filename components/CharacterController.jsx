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
  const FLIGHT_SPEED = 30;
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

  // Add path following state
  const [isFollowingPath, setIsFollowingPath] = useState(false);
  const currentPathIndex = useRef(0);
  const customPath = useRef(null);
  const onPathComplete = useRef(null);
  const pathPositions = useRef([
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
    [0, 35, 0], // Final position at center
  ]);

  // Expose methods
  useImperativeHandle(ref, () => ({
    moveToPosition: (position, callback, waypoints) => {
      if (rb.current) {
        // Start fade out
        setFadeOpacity(1);

        // Wait for fade out, then start path following
        fadeTimeout.current = setTimeout(() => {
          // If waypoints are provided, use them instead of default path
          if (waypoints) {
            customPath.current = waypoints;
          } else {
            customPath.current = null;
          }
          onPathComplete.current = callback;
          setIsFollowingPath(true);
          currentPathIndex.current = 0;

          // Start fade in
          setTimeout(() => {
            setFadeOpacity(0);
          }, 300);
        }, 300);
      }
    },
    teleportToPosition: (position, onComplete) => {
      if (rb.current) {
        // Start fade out
        setFadeOpacity(1);

        // Wait for fade out, then teleport
        fadeTimeout.current = setTimeout(() => {
          // Instantly move the character to the position
          rb.current.setTranslation(position, true);
          // Reset any movement state
          targetVelocity.current.set(0, 0, 0);
          currentVelocity.current.set(0, 0, 0);

          // Start fade in
          setTimeout(() => {
            setFadeOpacity(0);
            // Call the completion callback after fade in
            onComplete?.();
          }, 300);
        }, 300);
      }
    },
    getCurrentPosition: () => {
      if (rb.current) {
        const translation = rb.current.translation();
        return new Vector3(translation.x, translation.y, translation.z);
      }
      return new Vector3();
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

      if (isFollowingPath) {
        // Get current position
        const translation = rb.current.translation();
        const currentPos = new Vector3(
          translation.x,
          translation.y,
          translation.z
        );

        // Use custom path if available, otherwise use default path
        const currentPath = customPath.current || pathPositions.current;

        // Get target position from path
        const targetPos = new Vector3(...currentPath[currentPathIndex.current]);

        // Calculate direction to target
        const direction = targetPos.clone().sub(currentPos);
        const distance = direction.length();

        // If we're close enough to current target, move to next point
        if (distance < 2) {
          currentPathIndex.current++;

          // Check if we've reached the end of the path
          if (currentPathIndex.current >= currentPath.length) {
            setIsFollowingPath(false);
            customPath.current = null;

            // Call the completion callback
            if (onPathComplete.current) {
              onPathComplete.current();
              onPathComplete.current = null;
            }
            return;
          }

          // Get new target position
          targetPos.set(...currentPath[currentPathIndex.current]);
          direction.copy(targetPos).sub(currentPos);
        }

        // Normalize direction and set velocity directly
        direction.normalize();
        targetVelocity.current.set(
          direction.x * speed,
          direction.y * VERTICAL_SPEED,
          direction.z * speed
        );

        // Set character rotation to face movement direction
        characterRotationTarget.current = Math.atan2(direction.x, direction.z);
      } else {
        // Normal keyboard controls
        if (get().forward) horizontalMovement.z = 1;
        if (get().backward) horizontalMovement.z = -1;
        if (get().left) horizontalMovement.x = 1;
        if (get().right) horizontalMovement.x = -1;
        if (get().up) verticalMovement.y = 1;
        if (get().down) verticalMovement.y = -1;

        // Rest of the manual movement code...
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
              Math.sin(
                rotationTarget.current + characterRotationTarget.current
              ) * speed;
            targetVelocity.current.z =
              Math.cos(
                rotationTarget.current + characterRotationTarget.current
              ) * speed;
          } else {
            targetVelocity.current.x *= 0.95;
            targetVelocity.current.z *= 0.95;
          }

          targetVelocity.current.y = verticalMovement.y * VERTICAL_SPEED;
        } else {
          targetVelocity.current.set(0, 0, 0);
        }
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

      // Update character rotation
      if (
        isFollowingPath ||
        horizontalMovement.x !== 0 ||
        horizontalMovement.z !== 0
      ) {
        character.current.rotation.y = lerpAngle(
          character.current.rotation.y,
          characterRotationTarget.current,
          ROTATION_SMOOTHING
        );
      }

      // Update camera position based on mode
      if (isFollowingPath) {
        // During automatic path following, offset camera to the right
        cameraPosition.current.position.x = -100;
        cameraPosition.current.position.y = 30;
        cameraPosition.current.position.z = -50;
      } else {
        // Normal camera position for manual control
        cameraPosition.current.position.x = 0;
        cameraPosition.current.position.y = 30;
        cameraPosition.current.position.z = -50;
      }

      container.current.rotation.y = MathUtils.lerp(
        container.current.rotation.y,
        rotationTarget.current,
        ROTATION_SMOOTHING
      );

      cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
      camera.position.lerp(cameraWorldPosition.current, MOVEMENT_SMOOTHING);

      if (cameraTarget.current) {
        cameraTarget.current.getWorldPosition(
          cameraLookAtWorldPosition.current
        );
        cameraLookAt.current.lerp(
          cameraLookAtWorldPosition.current,
          MOVEMENT_SMOOTHING
        );

        camera.lookAt(cameraLookAt.current);
      }
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
          <group ref={cameraTarget} position-z={25} />
          <group ref={cameraPosition} />
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
