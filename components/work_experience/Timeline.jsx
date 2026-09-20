"use client";

import { useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import Image from "next/image";
import { experiences } from "@/constants";

const TimelineItem = ({ item }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  return (
    <div ref={ref} className="grid grid-cols-[auto_1fr] gap-4 md:gap-8">
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
          className="object-contain p-1 rounded-full"
          style={{ backgroundColor: item.iconBg }}
        />
      </motion.div>

      <motion.div
        initial="hidden"
        animate={controls}
        variants={{
          hidden: { opacity: 0, x: 50 },
          visible: { opacity: 1, x: 0 },
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`p-6 pr-20 rounded-lg border ${item.accentColor} backdrop-blur-sm relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:rounded-b-lg`}
      >
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="absolute top-6 right-6 text-sm font-medium text-blue-600 hover:underline"
          >
            View ↗
          </a>
        )}
        <h3 className="font-bold text-xl text-black dark:text-white">
          {item.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          {item.company}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {item.date}
        </p>
        {item.blurb && (
          <p className="text-gray-600 dark:text-gray-400 mt-4">{item.blurb}</p>
        )}
      </motion.div>
    </div>
  );
};

export default function ExperienceTimeline() {
  return (
    <div className="w-full py-16 px-4">
      <div className="relative">
        <div className="absolute left-6 w-0.5 h-full bg-gray-200" />
        <div className="space-y-12">
          {experiences.map((experience, index) => (
            <TimelineItem key={index} item={experience} />
          ))}
        </div>
      </div>
    </div>
  );
}
