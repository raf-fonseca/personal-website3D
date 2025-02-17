"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SkillsGrid from "./SkillsGrid";
import Timeline from "./Timeline";
import { socialLinks } from "@/constants";

const WorkExperience = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex justify-center z-50 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-white/90 dark:bg-black/90 rounded-xl shadow-xl 
                  max-w-6xl w-[90%] backdrop-blur-sm mx-4 overflow-y-auto max-h-[60vh]"
      >
        <main className="min-h-screen w-full max-w-6xl mx-auto px-8 py-8 space-y-16">
          {/* Header Section */}
          <section className="space-y-4 ">
            <h1 className="text-5xl font-bold text-black dark:text-white ">
              Hi, I&apos;m{" "}
              <span className="gradient-text inline-block">Rafael</span>
            </h1>
            <p className="text-lg text-muted-foreground ">
              I am a Software Developer studying Computer Engineering at the
              University of Waterloo. My passion for learning has led me to
              explore full-stack development, robotics, and Web3.
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
            <p className="text-muted-foreground">
              I&apos;ve worked with various companies, developing both technical
              and soft skills. Here&apos;s a summary:
            </p>
            <Timeline />
          </section>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md 
                     hover:bg-blue-600 transition-colors"
            onClick={() => {
              // Add logic for next destination
            }}
          >
            Continue Journey
          </motion.button>
        </main>

        {/* Gradient blur overlay at bottom */}
      </motion.div>
    </div>
  );
};

export default WorkExperience;
