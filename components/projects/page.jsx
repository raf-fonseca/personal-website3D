"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import ProjectCard from "./ProjectCard";
import { projects } from "@/constants";
import ScrollIndicator from "../ScrollIndicator";

const Projects = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && typeof onClose === "function") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative bg-white rounded-lg shadow-xl max-w-6xl w-[90%] m-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh]">
          <main className="w-full max-w-6xl mx-auto px-8 py-8 space-y-8">
            {/* Header Section */}
            <section className="space-y-4">
              <h1 className="text-5xl font-bold text-black dark:text-white">
                <span className="gradient-text inline-block">Projects</span>
              </h1>
            </section>

            {/* Projects Grid */}
            <section className="py-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </section>
          </main>
        </div>
      </motion.div>
      <ScrollIndicator />
    </motion.div>
  );
};

export default Projects;
