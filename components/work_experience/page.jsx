"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SkillsGrid from "./SkillsGrid";
import { socialLinks } from "@/constants";
import ExperienceTimeline from "./Timeline";
import { useEffect } from "react";
import { X } from "lucide-react";
import PropTypes from "prop-types";

const WorkExperience = ({ onWorkExperienceChange }) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && typeof onWorkExperienceChange === "function") {
        onWorkExperienceChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onWorkExperienceChange]);

  const handleClose = () => {
    if (typeof onWorkExperienceChange === "function") {
      onWorkExperienceChange(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center z-50 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/90 dark:bg-black/90 rounded-xl shadow-xl 
                  max-w-6xl w-[90%] backdrop-blur-sm mx-4 max-h-[80vh]"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 
                     transition-colors duration-200 z-50"
          aria-label="Close work experience"
        >
          <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[80vh]">
          <main className="w-full max-w-6xl mx-auto px-8 py-8 space-y-16">
            {/* Header Section */}
            <section className="space-y-4 ">
              <h1 className="text-5xl font-bold text-black dark:text-white ">
                Hi, I&apos;m{" "}
                <span className="gradient-text inline-block">Raf</span>
              </h1>
              <p className="text-lg text-muted-foreground ">
                I am a Software Developer studying Computer Engineering at the
                University of Waterloo. My passion for learning has led me to
                explore virtual reality, neural networks, and full-stack
                development.
              </p>
              <div className="flex justify-center gap-4">
                {socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.link}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <Image
                      src={social.iconUrl}
                      alt={social.name}
                      width={24}
                      height={24}
                    />
                    <span className="sr-only">{social.name}</span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Skills Section */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold text-black dark:text-white">
                Skills
              </h2>
              <SkillsGrid />
            </section>

            {/* Work Experience Section */}
            <section className="space-y-8">
              <h2 className="text-3xl font-bold text-black dark:text-white">
                Work Experience
              </h2>
              <ExperienceTimeline />
            </section>
          </main>
        </div>
      </motion.div>
    </div>
  );
};

WorkExperience.propTypes = {
  onWorkExperienceChange: PropTypes.func.isRequired,
};

export default WorkExperience;
