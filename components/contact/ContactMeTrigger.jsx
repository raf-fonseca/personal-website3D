'use client'
import { RigidBody } from '@react-three/rapier'
import { useState } from 'react'
import * as THREE from 'three'

export function ContactMeTrigger({
  position = [0, 0, 0],
  size = [20, 10, 30],
  onEnter,
  onExit,
}) {
  const [playerInside, setPlayerInside] = useState(false)

  return (
    <RigidBody
      type="fixed"
      colliders="cuboid"
      sensor
      position={position}
      onIntersectionEnter={(e) => {
        if (e.other.rigidBodyObject?.name === 'character' && !playerInside) {
          setPlayerInside(true)
          onEnter?.()
        }
      }}
      onIntersectionExit={(e) => {
        if (e.other.rigidBodyObject?.name === 'character' && playerInside) {
          setPlayerInside(false)
          onExit?.()
        }
      }}
    >
      {/* Semi-transparent box for visibility during development */}
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          transparent={true}
          opacity={0}
          side={2} // Makes the box visible from inside and outside
        />
      </mesh>
    </RigidBody>
  )
}

export default ContactMeTrigger
