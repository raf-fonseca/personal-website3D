'use client'
import { useKeyboardControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody } from '@react-three/rapier'
import {
  forwardRef,
  useRef,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react'
import { MathUtils, Vector3 } from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'
import { Character } from './Character'
import { useCoins } from '../contexts/CoinContext'

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI
  while (angle < -Math.PI) angle += 2 * Math.PI
  return angle
}

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start)
  end = normalizeAngle(end)

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI
    } else {
      end += 2 * Math.PI
    }
  }

  return normalizeAngle(start + (end - start) * t)
}

export const CharacterController = forwardRef((props, ref) => {
  // Fixed values instead of controls
  const FLIGHT_SPEED = 30
  const VERTICAL_SPEED = 20
  const ROTATION_SPEED = degToRad(20.107)
  const TILT_ANGLE = degToRad(15)
  const TILT_SPEED = 0.1
  const MOVEMENT_SMOOTHING = 0.05
  const ROTATION_SMOOTHING = 0.08

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
  ]

  const rb = useRef()
  const container = useRef()
  const character = useRef()
  const [isMovingToTarget, setIsMovingToTarget] = useState(false)
  const targetPosition = useRef(null)
  const onReachTarget = useRef(null)

  const targetTiltRef = useRef(0)
  const targetVelocity = useRef(new Vector3(0, 0, 0))
  const currentVelocity = useRef(new Vector3(0, 0, 0))
  const characterRotationTarget = useRef(0)
  const rotationTarget = useRef(0)
  const cameraTarget = useRef()
  const cameraPosition = useRef()
  const cameraWorldPosition = useRef(new Vector3())
  const cameraLookAtWorldPosition = useRef(new Vector3())
  const cameraLookAt = useRef(new Vector3())
  const [, get] = useKeyboardControls()
  const { collectedCoins, collectCoin } = useCoins()
  const lastCollectedCoinPosition = useRef(null)

  const { camera } = useThree()

  // Add path following state
  const [isFollowingPath, setIsFollowingPath] = useState(false)
  const currentPathIndex = useRef(0)
  const customPath = useRef(null)
  const onPathComplete = useRef(null)
  const [wasManualControlsJustEnabled, setWasManualControlsJustEnabled] =
    useState(false)

  // Update wasManualControlsJustEnabled when isAutomaticMode changes
  useEffect(() => {
    if (!props.isAutomaticMode) {
      setWasManualControlsJustEnabled(true)
      // Reset the flag after a short delay
      const timer = setTimeout(() => {
        setWasManualControlsJustEnabled(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [props.isAutomaticMode])

  // Define work experience and projects paths
  const workExperiencePath = useRef([
    [-3.832, 23.786, 15.436], // 1st coin
    [-20.832, 26.786, 30.436], // 2nd coin
    [-25.832, 30.786, 45.436], // 3rd coin
    [-20.832, 31.786, 65.436], // 4th coin
    [-5.832, 33.786, 80.436], // 5th coin
    [13.832, 35.786, 80.436], // 6th coin - Work Experience Target
  ])

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
    [20, 53.786, 65.436], // 15th coin
    [22, 53.786, 50.436], // 16th coin
    [12, 53.786, 35.436], // 17th coin
    [0, 53.786, 36.436], // 18th coin
    [-11, 53.786, 45.436], // 19th coin
    [-4, 65, 50], // 20th coin - Projects Target
  ])

  const contactPath = useRef([
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
    [22, 53.786, 50.436], // 16th coin
    [12, 53.786, 35.436], // 17th coin
    [0, 53.786, 36.436], // 18th coin
    [-11, 53.786, 45.436], // 19th coin
    [-4, 65, 50], // 20th coin
    [-4, 65, 50], // Contact Target
  ])

  // Function to find coin position in the path
  const findCoinPositionInPath = (coinId) => {
    if (coinId >= 0 && coinId < coinPositions.length) {
      return new Vector3(...coinPositions[coinId])
    }
    return null
  }

  // Update last collected coin position whenever collectedCoins changes
  useEffect(() => {
    if (collectedCoins.length > 0) {
      const lastCoinId = Math.max(...collectedCoins)
      const pos = findCoinPositionInPath(lastCoinId)
      if (pos) {
        lastCollectedCoinPosition.current = pos
      }
    }
  }, [collectedCoins])

  // Expose methods
  useImperativeHandle(ref, () => ({
    moveToPosition: (position, callback, waypoints) => {
      if (rb.current) {
        if (waypoints && waypoints.length > 0) {
          // Get current position and convert first waypoint to Vector3 if it isn't already
          const currentPos = rb.current.translation()

          // If we have a last collected coin position and it's in the waypoints, start from there
          let startIndex = 0
          if (lastCollectedCoinPosition.current) {
            startIndex = waypoints.findIndex((waypoint) => {
              if (!waypoint) return false
              const wp =
                waypoint instanceof Vector3
                  ? waypoint
                  : new Vector3(...waypoint)
              return wp.distanceTo(lastCollectedCoinPosition.current) < 0.1
            })

            // If found, start from the next waypoint
            if (startIndex !== -1) {
              startIndex += 1
            } else {
              startIndex = 0
            }
          }

          // If we're not starting from a collected coin, use current position
          if (startIndex === 0) {
            const firstWaypoint = waypoints[0]
            if (!firstWaypoint) return // Exit if no valid first waypoint

            const startPos =
              firstWaypoint instanceof Vector3
                ? firstWaypoint
                : new Vector3(...firstWaypoint)

            // If close to current position, use current position
            if (
              new Vector3(currentPos.x, currentPos.y, currentPos.z).distanceTo(
                startPos
              ) < 2
            ) {
              waypoints[0] = [currentPos.x, currentPos.y, currentPos.z]
            }
          }

          // Convert waypoints to Vector3 objects, starting from the appropriate point
          customPath.current = waypoints
            .slice(startIndex)
            .filter((waypoint) => waypoint) // Filter out any undefined waypoints
            .map((pos) =>
              pos instanceof Vector3 ? pos.clone() : new Vector3(...pos)
            )
          currentPathIndex.current = 0

          // Preserve current velocity for smooth transition
          const currentVel = rb.current.linvel()
          targetVelocity.current.set(currentVel.x, currentVel.y, currentVel.z)
        } else {
          customPath.current = null
        }

        onPathComplete.current = callback
        setIsFollowingPath(true)
      }
    },
    moveToWorkExperience: () => {
      moveToPosition(
        null,
        () => props.onWorkExperienceChange(true),
        workExperiencePath.current
      )
    },
    moveToProjects: () => {
      moveToPosition(
        null,
        () => props.onProjectsChange(true),
        projectsPath.current
      )
    },
    moveToContact: () => {
      moveToPosition(
        null,
        () => props.onContactChange(true),
        contactPath.current
      )
    },
    teleportToPosition: (position, onComplete) => {
      if (rb.current) {
        rb.current.setTranslation(position, true)
        // Reset movement and rotation state
        targetVelocity.current.set(0, 0, 0)
        currentVelocity.current.set(0, 0, 0)
        characterRotationTarget.current = 0
        rotationTarget.current = 0
        onComplete?.()
      }
    },
    getCurrentPosition: () => {
      if (rb.current) {
        const translation = rb.current.translation()
        return new Vector3(translation.x, translation.y, translation.z)
      }
      return new Vector3()
    },
    getCollectedCoins: () => collectedCoins,
    getLastCollectedCoinPosition: () => lastCollectedCoinPosition.current,
  }))

  useFrame(({ camera }) => {
    if (rb.current) {
      let horizontalMovement = { x: 0, z: 0 }
      let verticalMovement = { y: 0 }
      let speed = FLIGHT_SPEED

      // Check for manual movement input
      const hasManualInput =
        get().forward ||
        get().backward ||
        get().leftward ||
        get().rightward ||
        get().up ||
        get().down

      // If we detect manual movement input while following path and manual controls weren't just enabled, clear the path
      if (hasManualInput && isFollowingPath && !wasManualControlsJustEnabled) {
        setIsFollowingPath(false)
        customPath.current = null
        // Remove the completion callback when manually interrupting
        onPathComplete.current = null
        // Reset velocity for smooth transition to manual control
        targetVelocity.current.set(0, 0, 0)
        currentVelocity.current.set(0, 0, 0)
      }

      if (isFollowingPath) {
        const translation = rb.current.translation()
        const currentPos = new Vector3(
          translation.x,
          translation.y,
          translation.z
        )

        const currentPath = customPath.current
        if (!currentPath) return

        // Get target position from path
        const targetPos = currentPath[currentPathIndex.current]
        if (!targetPos) return

        // Calculate direction to target
        const direction = targetPos.clone().sub(currentPos)
        const distance = direction.length()

        // If we're close enough to current target, move to next point
        if (distance < 2) {
          currentPathIndex.current++

          // Check if we've reached the end of the path
          if (currentPathIndex.current >= currentPath.length) {
            setIsFollowingPath(false)
            customPath.current = null

            characterRotationTarget.current += Math.PI
            rotationTarget.current += Math.PI

            if (onPathComplete.current) {
              onPathComplete.current()
              onPathComplete.current = null
            }
            return
          }

          // Get new target position
          targetPos.copy(currentPath[currentPathIndex.current])
          direction.copy(targetPos).sub(currentPos)
        }

        // Normalize direction and set velocity directly
        direction.normalize()
        targetVelocity.current.set(
          direction.x * speed,
          direction.y * VERTICAL_SPEED,
          direction.z * speed
        )

        // Set character rotation to face movement direction
        characterRotationTarget.current = Math.atan2(direction.x, direction.z)
      } else {
        // Process manual movement only if manual mode is enabled
        if (!props.isAutomaticMode) {
          if (get().forward) horizontalMovement.z = 1
          if (get().backward) horizontalMovement.z = -1
          if (get().leftward) horizontalMovement.x = 1
          if (get().rightward) horizontalMovement.x = -1
          if (get().up) verticalMovement.y = 1
          if (get().down) verticalMovement.y = -1

          // Rotation based on left/right input
          if (horizontalMovement.x !== 0) {
            rotationTarget.current = MathUtils.lerp(
              rotationTarget.current,
              rotationTarget.current + ROTATION_SPEED * horizontalMovement.x,
              ROTATION_SMOOTHING
            )
          }

          const isHorizontallyMoving =
            horizontalMovement.x !== 0 || horizontalMovement.z !== 0
          const isCurrentlyMoving =
            isHorizontallyMoving || verticalMovement.y !== 0

          targetTiltRef.current = isHorizontallyMoving ? TILT_ANGLE : 0

          if (character.current) {
            character.current.rotation.x = MathUtils.lerp(
              character.current.rotation.x,
              targetTiltRef.current,
              TILT_SPEED
            )
          }

          if (isCurrentlyMoving) {
            if (isHorizontallyMoving) {
              characterRotationTarget.current = Math.atan2(
                horizontalMovement.x,
                horizontalMovement.z
              )

              targetVelocity.current.x =
                Math.sin(
                  rotationTarget.current + characterRotationTarget.current
                ) * FLIGHT_SPEED
              targetVelocity.current.z =
                Math.cos(
                  rotationTarget.current + characterRotationTarget.current
                ) * FLIGHT_SPEED
            } else {
              // Apply damping if only moving vertically
              targetVelocity.current.x *= 0.95
              targetVelocity.current.z *= 0.95
            }

            targetVelocity.current.y = verticalMovement.y * VERTICAL_SPEED
          } else {
            // If no manual input, reset target velocity
            targetVelocity.current.set(0, 0, 0)
          }
        } else {
          // If in automatic mode, ensure target velocity is zeroed unless path following takes over
          targetVelocity.current.set(0, 0, 0)
        }
      }

      currentVelocity.current.lerp(targetVelocity.current, MOVEMENT_SMOOTHING)

      rb.current.setLinvel(
        {
          x: currentVelocity.current.x,
          y: currentVelocity.current.y,
          z: currentVelocity.current.z,
        },
        true
      )

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
        )
      }

      // Update camera position based on mode
      if (isFollowingPath) {
        // Get character's current position
        const translation = rb.current.translation()

        // Calculate camera offset based on character's height
        // As the character goes higher, adjust the camera height and distance
        const heightFactor = Math.min(translation.y / 50, 1) // Normalize height between 0 and 1

        // Side view camera position
        cameraPosition.current.position.x = -50 // Fixed distance to the side
        cameraPosition.current.position.y = translation.y + 10 // Follow character's height with offset
        cameraPosition.current.position.z = translation.z // Match character's Z position

        // Update container rotation to maintain side view
        const sideViewAngle = Math.PI * 2 // 90 degrees for side view
        container.current.rotation.y = sideViewAngle
        rotationTarget.current = sideViewAngle

        // Adjust camera target to look at character
        if (cameraTarget.current) {
          cameraTarget.current.position.x = 25 // Look ahead of character
          cameraTarget.current.position.y = 0 // Same height as character
          cameraTarget.current.position.z = 0 // Same Z as character
        }
      } else {
        // Normal camera position for manual control
        cameraPosition.current.position.x = 0
        cameraPosition.current.position.y = 30
        cameraPosition.current.position.z = -50

        // Reset camera target for manual control
        if (cameraTarget.current) {
          cameraTarget.current.position.z = 25
          cameraTarget.current.position.x = 0
          cameraTarget.current.position.y = 0
        }
      }

      container.current.rotation.y = MathUtils.lerp(
        container.current.rotation.y,
        rotationTarget.current,
        ROTATION_SMOOTHING
      )

      cameraPosition.current.getWorldPosition(cameraWorldPosition.current)
      camera.position.lerp(cameraWorldPosition.current, MOVEMENT_SMOOTHING)

      if (cameraTarget.current) {
        cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current)
        cameraLookAt.current.lerp(
          cameraLookAtWorldPosition.current,
          MOVEMENT_SMOOTHING
        )

        camera.lookAt(cameraLookAt.current)
      }
    }
  })

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
    </>
  )
})

export default CharacterController
