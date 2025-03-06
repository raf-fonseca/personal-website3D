"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import { experiences } from "@/constants";
import Image from "next/image";

const TimelineItem = ({ item, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const isEven = index % 2 === 0;

  return (
    <div ref={ref} className="relative">
      {/* Mobile Layout */}
      <div className="md:hidden grid grid-cols-[auto_1fr] gap-4">
        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, scale: 0.5 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative w-12 h-12 rounded-full flex items-center justify-center z-10 bg-white border-2 shadow-md overflow-hidden"
        >
          <Image
            src={item.icon}
            alt={item.company}
            fill
            className="object-contain p-2"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`p-6 rounded-lg border ${item.accentColor} backdrop-blur-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:rounded-b-lg`}
        >
          <h3 className="font-bold text-xl text-black dark:text-white">
            {item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            {item.company}
          </p>
          <ul className="mt-4 pl-4 space-y-2 list-disc ">
            {item.points.map((point, i) => (
              <li key={i} className="text-gray-600 dark:text-gray-400 mr-4">
                {point}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {item.date}
          </p>
        </motion.div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8 md:items-start">
        <div className={isEven ? "" : "col-start-1 text-right"}>
          {isEven ? (
            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`p-6 rounded-lg border ${item.accentColor} backdrop-blur-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:rounded-b-lg`}
            >
              <h3 className="font-bold text-xl text-black dark:text-white">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {item.company}
              </p>
              <ul className="mt-4 pl-4 space-y-2 list-disc ">
                {item.points.map((point, i) => (
                  <li
                    key={i}
                    className="text-gray-600 dark:text-gray-400 text-sm"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : (
            <motion.p
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-gray-500 dark:text-gray-400 pt-6 pr-4"
            >
              {item.date}
            </motion.p>
          )}
        </div>

        <motion.div
          initial="hidden"
          animate={controls}
          variants={{
            hidden: { opacity: 0, scale: 0.5 },
            visible: { opacity: 1, scale: 1 },
          }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="relative w-12 h-12 rounded-full flex items-center justify-center z-10 bg-white border-2 shadow-md overflow-hidden"
        >
          <Image
            src={item.icon}
            alt={item.company}
            width={48}
            height={48}
            className={`object-contain p-1 rounded-full`}
            style={{ backgroundColor: item.iconBg }}
          />
        </motion.div>

        <div className={isEven ? "col-start-3" : ""}>
          {isEven ? (
            <motion.p
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-gray-500 dark:text-gray-400 pt-6 pl-4"
            >
              {item.date}
            </motion.p>
          ) : (
            <motion.div
              initial="hidden"
              animate={controls}
              variants={{
                hidden: { opacity: 0, x: 50 },
                visible: { opacity: 1, x: 0 },
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`p-6 rounded-lg border ${item.accentColor} backdrop-blur-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:rounded-b-lg`}
            >
              <h3 className="font-bold text-xl text-black dark:text-white">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                {item.company}
              </p>
              <ul className="mt-4 pl-4 space-y-2 list-disc ">
                {item.points.map((point, i) => (
                  <li
                    key={i}
                    className="text-gray-600 dark:text-gray-400 text-sm "
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function ExperienceTimeline() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute md:left-1/2 left-6 transform -translate-x-1/2 w-0.5 h-full bg-gray-200" />

        {/* Timeline Items */}
        <div className="space-y-12">
          {experiences.map((experience, index) => (
            <TimelineItem key={index} item={experience} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
