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
import ScrollIndicator from "../ScrollIndicator";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm py-4 sm:py-6 md:py-8 lg:py-10"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative bg-white rounded-lg shadow-xl max-w-6xl w-[90%] m-4 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-50"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[90vh]">
          <main className="w-full max-w-6xl mx-auto px-8 py-8 space-y-16">
            {/* Header Section */}
            <section className="space-y-4">
              <h1 className="text-5xl font-bold text-black dark:text-white">
                Hi, I&apos;m{" "}
                <span className="gradient-text inline-block">Raf</span>
              </h1>
              <p className="text-lg text-muted-foreground">
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
      <ScrollIndicator />
    </motion.div>
  );
};

WorkExperience.propTypes = {
  onWorkExperienceChange: PropTypes.func.isRequired,
};

export default WorkExperience;
