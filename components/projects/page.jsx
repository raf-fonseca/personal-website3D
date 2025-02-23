"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import SkillsGrid from "../work_experience/SkillsGrid";
import { socialLinks } from "@/constants";
import ExperienceTimeline from "../work_experience/Timeline";
import { Button } from "../ui/button";

const Projects = ({ isVisible }) => {
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
            <section className="space-y-4 ">
              <h1 className="text-5xl font-bold text-black dark:text-white ">
                Hi, I&apos;m{" "}
                <span className="gradient-text inline-block">Rafael</span>
              </h1>
              <p className="text-lg text-muted-foreground ">
                I am a Software Developer studying Computer Engineering at the
                University of Waterloo. My passion for learning has led me to
                explore full-stack development, neural networks, and virtual
                reality.
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

        {/* Button outside of scrollable area */}
        <Button
          variant="island"
          className="absolute bottom-8 right-8 px-4 py-2 text-white rounded-md 
                   hover:bg-blue-600 transition-colors shadow-lg z-10"
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
};

export default Projects;
