"use client";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import { MathUtils, Vector3, DoubleSide, NormalBlending } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { Character } from "./Character";
import { useSpring, animated } from "@react-spring/three";
import { useCoins } from "../contexts/CoinContext";

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

  // Define coin positions at component scope
  const coinPositions = [
    [-3.832, 23.786, 15.436], // 1st coin
    [-20.832, 26.786, 30.436], // 2nd coin
    [-25.832, 30.786, 45.436], // 3rd coin
    [-20.832, 31.786, 65.436], // 4th coin
    [-5.832, 33.786, 80.436], // 5th coin
    [13.832, 35.786, 80.436], // 6th coin
    [30, 35.786, 70.436], // 7th coin
    [35, 38.786, 50.436], // 8th coin
    [25, 40.786, 30.436], // 9th coin
    [5, 40.786, 25.436], // 10th coin
    [-9, 43.786, 28.436], // 11th coin
    [-17, 45.786, 45.436], // 12th coin
    [-17, 48.786, 60.436], // 13th coin
    [-5, 48.786, 70.436], // 14th coin
    [20, 53.786, 65.436], // 15th coin
  ];

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
  const { collectedCoins, collectCoin } = useCoins();
  const lastCollectedCoinPosition = useRef(null);

  const [fadeOpacity, setFadeOpacity] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const { camera } = useThree();

  // Create spring animation for fade with adjusted config
  const fadeSpring = useSpring({
    opacity: fadeOpacity,
    config: {
      mass: 1,
      tension: 180,
      friction: 20,
      clamp: true,
    },
  });

  // Add path following state
  const [isFollowingPath, setIsFollowingPath] = useState(false);
  const currentPathIndex = useRef(0);
  const customPath = useRef(null);
  const onPathComplete = useRef(null);

  // Define work experience and projects paths
  const workExperiencePath = useRef([
    [-3.832, 23.786, 15.436], // 1st coin
    [-20.832, 26.786, 30.436], // 2nd coin
    [-25.832, 30.786, 45.436], // 3rd coin
    [-20.832, 31.786, 65.436], // 4th coin
    [-5.832, 33.786, 80.436], // 5th coin
    [13.832, 35.786, 80.436], // 6th coin - Work Experience Target
  ]);

  const projectsPath = useRef([
    [-3.832, 23.786, 15.436], // 1st coin
    [-20.832, 26.786, 30.436], // 2nd coin
    [-25.832, 30.786, 45.436], // 3rd coin
    [-20.832, 31.786, 65.436], // 4th coin
    [-5.832, 33.786, 80.436], // 5th coin
    [13.832, 35.786, 80.436], // 6th coin
    [30, 35.786, 70.436], // 7th coin
    [35, 38.786, 50.436], // 8th coin
    [25, 40.786, 30.436], // 9th coin
    [5, 40.786, 25.436], // 10th coin
    [-9, 43.786, 28.436], // 11th coin
    [-17, 45.786, 45.436], // 12th coin
    [-17, 48.786, 60.436], // 13th coin
    [-5, 48.786, 70.436], // 14th coin
    [20, 53.786, 65.436], // 15th coin - Projects Target
  ]);

  // Function to find coin position in the path
  const findCoinPositionInPath = (coinId) => {
    if (coinId >= 0 && coinId < coinPositions.length) {
      return new Vector3(...coinPositions[coinId]);
    }
    return null;
  };

  // Update last collected coin position whenever collectedCoins changes
  useEffect(() => {
    if (collectedCoins.length > 0) {
      const lastCoinId = Math.max(...collectedCoins);
      const pos = findCoinPositionInPath(lastCoinId);
      if (pos) {
        lastCollectedCoinPosition.current = pos;
      }
    }
  }, [collectedCoins]);

  // Expose methods
  useImperativeHandle(ref, () => ({
    moveToPosition: (position, callback, waypoints) => {
      if (rb.current && !isFading) {
        setIsFading(true);
        setFadeOpacity(1);

        setTimeout(() => {
          if (waypoints) {
            // Get current position and convert first waypoint to Vector3 if it isn't already
            const currentPos = rb.current.translation();

            // If we have a last collected coin position and it's in the waypoints, start from there
            let startIndex = 0;
            if (lastCollectedCoinPosition.current) {
              startIndex = waypoints.findIndex((waypoint) => {
                const wp =
                  waypoint instanceof Vector3
                    ? waypoint
                    : new Vector3(...waypoint);
                return wp.distanceTo(lastCollectedCoinPosition.current) < 0.1;
              });

              // If found, start from the next waypoint
              if (startIndex !== -1) {
                startIndex += 1;
              } else {
                startIndex = 0;
              }
            }

            // If we're not starting from a collected coin, use current position
            if (startIndex === 0) {
              const firstWaypoint = waypoints[0];
              const startPos =
                firstWaypoint instanceof Vector3
                  ? firstWaypoint
                  : new Vector3(...firstWaypoint);

              // If close to current position, use current position
              if (
                new Vector3(
                  currentPos.x,
                  currentPos.y,
                  currentPos.z
                ).distanceTo(startPos) < 2
              ) {
                waypoints[0] = [currentPos.x, currentPos.y, currentPos.z];
              }
            }

            // Convert waypoints to Vector3 objects, starting from the appropriate point
            customPath.current = waypoints
              .slice(startIndex)
              .map((pos) =>
                pos instanceof Vector3 ? pos.clone() : new Vector3(...pos)
              );
            currentPathIndex.current = 0;

            // Preserve current velocity for smooth transition
            const currentVel = rb.current.linvel();
            targetVelocity.current.set(
              currentVel.x,
              currentVel.y,
              currentVel.z
            );
          } else {
            customPath.current = null;
          }

          onPathComplete.current = callback;
          setIsFollowingPath(true);
          setFadeOpacity(0);

          setTimeout(() => {
            setIsFading(false);
          }, 300);
        }, 300);
      }
    },
    teleportToPosition: (position, onComplete) => {
      if (rb.current && !isFading) {
        setIsFading(true);
        setFadeOpacity(1);

        setTimeout(() => {
          rb.current.setTranslation(position, true);
          // Reset movement and rotation state
          targetVelocity.current.set(0, 0, 0);
          currentVelocity.current.set(0, 0, 0);
          characterRotationTarget.current = 0;
          rotationTarget.current = 0;

          setFadeOpacity(0);

          setTimeout(() => {
            onComplete?.();
            setIsFading(false);
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
    getCollectedCoins: () => collectedCoins,
    getLastCollectedCoinPosition: () => lastCollectedCoinPosition.current,
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
        const translation = rb.current.translation();
        const currentPos = new Vector3(
          translation.x,
          translation.y,
          translation.z
        );

        const currentPath = customPath.current;
        if (!currentPath) return;

        // Get target position from path
        const targetPos = currentPath[currentPathIndex.current];
        if (!targetPos) return;

        // Calculate direction to target
        const direction = targetPos.clone().sub(currentPos);
        const distance = direction.length();

        // If we're close enough to current target, collect the coin and move to next point
        if (distance < 2) {
          // Find the coin index based on position
          const coinIndex = coinPositions.findIndex(
            (pos) =>
              Math.abs(pos[0] - targetPos.x) < 0.1 &&
              Math.abs(pos[1] - targetPos.y) < 0.1 &&
              Math.abs(pos[2] - targetPos.z) < 0.1
          );

          if (coinIndex !== -1 && !collectedCoins.includes(coinIndex)) {
            collectCoin(coinIndex);
          }

          currentPathIndex.current++;

          // Check if we've reached the end of the path
          if (currentPathIndex.current >= currentPath.length) {
            setIsFollowingPath(false);
            customPath.current = null;

            if (onPathComplete.current) {
              onPathComplete.current();
              onPathComplete.current = null;
            }
            return;
          }

          // Get new target position
          targetPos.copy(currentPath[currentPathIndex.current]);
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
        // Only process keyboard controls if not following path
        if (!isFollowingPath) {
          if (get().forward) horizontalMovement.z = 1;
          if (get().backward) horizontalMovement.z = -1;
          if (get().left) horizontalMovement.x = 1;
          if (get().right) horizontalMovement.x = -1;
          if (get().up) verticalMovement.y = 1;
          if (get().down) verticalMovement.y = -1;
        }

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
        // Get character's current position
        const translation = rb.current.translation();

        // Calculate camera offset based on character's height
        // As the character goes higher, adjust the camera height and distance
        const heightFactor = Math.min(translation.y / 50, 1); // Normalize height between 0 and 1

        // Side view camera position
        cameraPosition.current.position.x = -50; // Fixed distance to the side
        cameraPosition.current.position.y = translation.y + 10; // Follow character's height with offset
        cameraPosition.current.position.z = translation.z; // Match character's Z position

        // Update container rotation to maintain side view
        const sideViewAngle = Math.PI * 2; // 90 degrees for side view
        container.current.rotation.y = sideViewAngle;
        rotationTarget.current = sideViewAngle;

        // Adjust camera target to look at character
        if (cameraTarget.current) {
          cameraTarget.current.position.x = 25; // Look ahead of character
          cameraTarget.current.position.y = 0; // Same height as character
          cameraTarget.current.position.z = 0; // Same Z as character
        }
      } else {
        // Normal camera position for manual control
        cameraPosition.current.position.x = 0;
        cameraPosition.current.position.y = 30;
        cameraPosition.current.position.z = -50;

        // Reset camera target for manual control
        if (cameraTarget.current) {
          cameraTarget.current.position.z = 25;
          cameraTarget.current.position.x = 0;
          cameraTarget.current.position.y = 0;
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

      {/* Camera-relative fade overlay */}
      <group position={[0, 0, 0]}>
        <animated.mesh renderOrder={9999}>
          <planeGeometry args={[100, 100]} />
          <animated.meshBasicMaterial
            transparent
            opacity={fadeSpring.opacity}
            color="white"
            depthTest={false}
            depthWrite={false}
            side={DoubleSide}
            blending={NormalBlending}
            fog={false}
          />
        </animated.mesh>
      </group>

      {/* Fixed position overlay for complete coverage */}
      <animated.mesh position={[0, 0, 0]} renderOrder={9998}>
        <planeGeometry args={[1000000, 1000000]} />
        <animated.meshBasicMaterial
          transparent
          opacity={fadeSpring.opacity}
          color="white"
          depthTest={false}
          depthWrite={false}
          side={DoubleSide}
          blending={NormalBlending}
          fog={false}
        />
      </animated.mesh>
    </>
  );
});

export default CharacterController;
