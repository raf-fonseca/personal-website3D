"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { socialLinks } from "@/constants";
import { FaEnvelope } from "react-icons/fa6";
import { useEffect } from "react";

export default function Contact({ onContactChange }) {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && typeof onContactChange === "function") {
        onContactChange(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onContactChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={() => onContactChange(false)}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="relative w-full max-w-2xl p-8 bg-white rounded-lg shadow-xl m-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => onContactChange(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 gradient-text">
            Let's Connect!
          </h2>
          {/* <h1 className="text-5xl font-bold text-black dark:text-white">
                <span className="gradient-text inline-block">My Projects</span>
              </h1> */}
          <p className="text-gray-600 mb-8">
            Thank you for visiting my portfolio and getting this far!
          </p>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Image
                  src={social.iconUrl}
                  alt={social.name}
                  width={24}
                  height={24}
                />
                <span className="sr-only">{social.name}</span>
              </a>
            ))}
          </div>

          {/* Email */}
          <a
            href="mailto:rsilvano@uwaterloo.ca"
            className="flex items-center justify-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaEnvelope className="text-2xl text-gray-700" />
            <span className="text-gray-700">rsilvano@uwaterloo.ca</span>
          </a>

          <div className="mt-8 text-gray-600">
            <p className="text-sm">
              I'm always open to discussing new projects, opportunities, or just
              having a friendly chat!
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
