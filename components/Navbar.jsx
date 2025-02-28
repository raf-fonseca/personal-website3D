"use client";

import { CoinsIcon as Coin } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

export default function Navbar() {
  const [progress, setProgress] = useState(20); // 20% progress (3/15)

  return (
    <div className="flex items-center justify-center">
      <div className="w-full py-4 px-4 rounded-xl">
        <div className="grid grid-cols-3 items-center gap-3 sm:gap-6">
          {/* Logo */}
          <div className="flex items-center justify-start">
            <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-lg border-2 border-gray-800">
              <span className="text-lg sm:text-xl font-bold">R</span>
            </div>
          </div>

          {/* Progress section - centered */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {/* Current progress number */}
            <span className="text-base sm:text-xl font-medium">3</span>

            {/* Progress bar with fixed width that's responsive */}
            <div className="w-32 sm:w-48 md:w-64 lg:w-80 h-2 sm:h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Total with coin icon */}
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-xl font-medium">15</span>
              <Coin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-200" />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-end gap-3 sm:gap-6">
            {/* <a
              href="#"
              className="text-base sm:text-lg font-medium hover:underline"
            >
              Experience
            </a>
            <a
              href="#"
              className="text-base sm:text-lg font-medium hover:underline"
            >
              Projects
            </a> */}
            <Button>Add Project</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
