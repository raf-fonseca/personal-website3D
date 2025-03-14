"use client";

import { CoinsIcon as Coin } from "lucide-react";
import { useCoins } from "../contexts/CoinContext";
import { Button } from "./ui/button";
import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export default function Navbar({ onExperienceClick, onProjectsClick }) {
  const { collectedCoins, totalCoins, progressPercentage } = useCoins();
  const prevProgressRef = useRef(progressPercentage);

  // Function to trigger confetti with multiple bursts
  const triggerConfetti = () => {
    // First burst
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#fbbf24", "#fcd34d", "#fde68a", "#4ade80", "#34d399"],
    });

    // Second burst after a short delay
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ["#fbbf24", "#fcd34d", "#fde68a"],
      });
    }, 300);

    // Third burst from the other side
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ["#fbbf24", "#fcd34d", "#fde68a"],
      });
    }, 600);
  };

  // Check if progress has reached 100% and trigger confetti
  useEffect(() => {
    // Only trigger confetti when progress changes from less than 100 to exactly 100
    if (prevProgressRef.current < 100 && progressPercentage === 100) {
      triggerConfetti();
    }

    // Update the ref for the next render
    prevProgressRef.current = progressPercentage;
  }, [progressPercentage]);

  return (
    <div className="flex items-center justify-center">
      <div className="w-full py-4 px-4 rounded-xl">
        <div className="grid grid-cols-3 items-center gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <div className="w-14 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-[#4caf50] to-[#8bc34a] shadow-lg hover:shadow-xl transition-shadow duration-300">
              <span className="text-lg sm:text-xl font-bold text-white">
                RF
              </span>
            </div>
          </div>

          {/* Progress section - centered */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* Current progress number */}
            <span className="text-base sm:text-xl font-medium">
              {collectedCoins.length}
            </span>

            {/* Progress bar with fixed width that's responsive */}
            <div className="w-32 sm:w-48 md:w-64 lg:w-80 h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 transition-all duration-700 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Total with coin icon */}
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl font-medium">
                {totalCoins}
              </span>
              <Coin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-200" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-end gap-3 sm:gap-6">
            <Button variant="island" onClick={onExperienceClick}>
              Experience
            </Button>
            <Button variant="island" onClick={onProjectsClick}>
              Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
