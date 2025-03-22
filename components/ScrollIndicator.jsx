"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ScrollIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);
  const modalRef = useRef(null);

  useEffect(() => {
    const modal = document.querySelector(".overflow-y-auto");
    if (!modal) return;

    const handleScroll = () => {
      // Hide indicator after user has scrolled a bit
      if (modal.scrollTop > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };

    modal.addEventListener("scroll", handleScroll);
    return () => modal.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-50"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: {
          duration: 0.5,
          delay: 1,
        },
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 shadow-sm flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-500"
        >
          <path d="M12 5v14" />
          <path d="m19 12-7 7-7-7" />
        </svg>
      </div>
    </motion.div>
  );
};

export default ScrollIndicator;
