"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SkillsGrid from "../work_experience/SkillsGrid";
import { socialLinks } from "@/constants";
import ExperienceTimeline from "../work_experience/Timeline";
import { Button } from "../ui/button";

const Projects = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex justify-center z-50 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/90 dark:bg-black/90 rounded-xl shadow-xl 
                  max-w-6xl w-[90%] backdrop-blur-sm mx-4 max-h-[80vh]"
      >
        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[80vh]">
          <main className="w-full max-w-6xl mx-auto px-8 py-8 space-y-16">
            {/* Header Section */}
            <section className="space-y-4">
              <h1 className="text-5xl font-bold text-black dark:text-white">
                <span className="gradient-text inline-block">My Projects</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Here are some of my notable projects and contributions.
              </p>
            </section>

            {/* Projects Grid will go here */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Project cards will be added here */}
            </section>
          </main>
        </div>

        {/* Close button */}
        <Button
          variant="island"
          className="absolute bottom-8 right-8 px-4 py-2 text-white rounded-md 
                   hover:bg-blue-600 transition-colors shadow-lg z-10"
          onClick={onClose}
        >
          Close
        </Button>
      </motion.div>
    </div>
  );
};

export default Projects;
