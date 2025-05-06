'use client'
import { KeyboardControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { Experience } from '@/components/Experience'
import Navbar from '@/components/Navbar'
import WorkExperience from '@/components/work_experience/page'
import Projects from '@/components/projects/page'
import Contact from '@/components/contact/page'
import MovementInstructions from '@/components/MovementInstructions'
import Loader from '@/components/Loader'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronsRight } from 'lucide-react'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'up', keys: ['Space'] },
  { name: 'down', keys: ['ShiftLeft'] },
]

function App() {
  const [showWorkExperience, setShowWorkExperience] = useState(false)
  const [showProjects, setShowProjects] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [isAutomaticMode, setIsAutomaticMode] = useState(false)
  const [isManualMode, setIsManualMode] = useState(false)
  const [isCharacterPathing, setIsCharacterPathing] = useState(false)
  const experienceRef = useRef()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isManualMode && e.key === 'Space') {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isManualMode])

  const handleWorkExperienceChange = (value) => {
    setShowWorkExperience(value)
  }

  const handleProjectsChange = (value) => {
    setShowProjects(value)
  }

  const handleContactChange = (value) => {
    setShowContact(value)
  }

  const handleExperienceClick = () => {
    if (experienceRef.current) {
      experienceRef.current.moveToWorkExperience()
    }
  }

  const handleProjectsClick = () => {
    if (experienceRef.current) {
      experienceRef.current.moveToProjects()
    }
  }

  const handleContactClick = () => {
    if (experienceRef.current) {
      experienceRef.current.moveToContact()
    }
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Navbar positioned absolutely at the top */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar
          onExperienceClick={handleExperienceClick}
          onProjectsClick={handleProjectsClick}
          onContactClick={handleContactClick}
        />
      </div>

      {/* Work Experience Overlay */}
      {showWorkExperience && (
        <WorkExperience onWorkExperienceChange={handleWorkExperienceChange} />
      )}

      {/* Projects Overlay */}
      {showProjects && (
        <Projects
          isVisible={showProjects}
          onClose={() => handleProjectsChange(false)}
        />
      )}

      {/* Contact Overlay */}
      {showContact && <Contact onContactChange={handleContactChange} />}

      {/* Canvas taking up the entire screen */}
      <KeyboardControls map={keyboardMap} enabled={isManualMode}>
        <Suspense fallback={<Loader />}>
          <Canvas
            shadows={{ type: 'PCFSoftShadowMap', enabled: true }}
            dpr={[1, 2]}
            camera={{ position: [0, 80, -100], near: 0.1, fov: 40 }}
            gl={{
              antialias: true,
              alpha: false,
              stencil: false,
              depth: true,
              powerPreference: 'high-performance',
            }}
            style={{
              touchAction: 'none',
              background:
                'linear-gradient(to bottom, #94c5f8 0%, #a7daf9 26%, #b6dfff 59%, #daefff 100%)',
            }}
            className="w-full h-full"
            performance={{ min: 0.5 }}
          >
            <color attach="background" args={['#87CEEB']} />
            <Experience
              ref={experienceRef}
              onWorkExperienceChange={handleWorkExperienceChange}
              onProjectsChange={handleProjectsChange}
              onContactChange={handleContactChange}
              onAutomaticModeChange={setIsAutomaticMode}
              isManualMode={isManualMode}
              onPathFollowingStatusChange={setIsCharacterPathing}
            />
          </Canvas>
        </Suspense>
        {/* <Loader /> */}
      </KeyboardControls>

      {/* Movement Instructions */}
      <MovementInstructions
        isVisible={!isAutomaticMode}
        onToggleManualMode={setIsManualMode}
      />

      {/* Skip to Destination Button */}
      <AnimatePresence mode="wait">
        {isAutomaticMode && isCharacterPathing && (
          <motion.div
            className="absolute bottom-4 left-0 right-0 z-50 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
              mass: 0.8,
            }}
          >
            <button
              onClick={() => {
                if (experienceRef.current) {
                  experienceRef.current.skipAutomaticNavigation()
                }
              }}
              className="bg-white/80 rounded-lg shadow-lg text-slate-700 font-semibold py-2 px-4 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-opacity-75 hover:bg-white/95 transition-colors duration-150"
            >
              Skip to Destination
              <ChevronsRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
