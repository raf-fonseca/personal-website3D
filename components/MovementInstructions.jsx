"use client";

import { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function KeyButton({ children, wide = false }) {
  return (
    <motion.div
      className={cn(
        "flex items-center justify-center bg-white border border-slate-200 rounded-md shadow-sm font-mono text-slate-800 text-sm py-1.5",
        wide ? "px-3" : "px-2"
      )}
      whileHover={{
        y: -2,
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      }}
      whileTap={{ y: 0, boxShadow: "none" }}
      transition={{ duration: 0.2 }}
      layout
    >
      {children}
    </motion.div>
  );
}

function CustomToggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
        // Remove focus after clicking
        e.target.blur();
      }}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent shadow-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-gradient-to-r from-[#4caf50] to-[#8bc34a] hover:from-[#3d8b40] hover:to-[#7cb342]"
          : "bg-slate-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  );
}

export default function MovementInstructions({ onToggleManualMode }) {
  const [showControls, setShowControls] = useState(false);

  const handleToggle = (checked) => {
    setShowControls(checked);
    onToggleManualMode(checked);
    // Remove focus from any focused element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div className="absolute bottom-4 left-4">
      <LayoutGroup>
        <motion.div className="flex flex-col items-center" layout>
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden w-64 mb-4"
            layout="position"
            layoutId="control-toggle"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-slate-700" />
                <Label
                  htmlFor="show-controls"
                  className="text-lg font-medium text-slate-700 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggle(!showControls);
                    // Remove focus after clicking
                    e.target.blur();
                  }}
                >
                  Manual Controls
                </Label>
              </div>
              <CustomToggle checked={showControls} onChange={handleToggle} />
            </div>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {showControls && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0, originY: 0 }}
                animate={{ opacity: 1, scaleY: 1, originY: 0 }}
                exit={{ opacity: 0, scaleY: 0, originY: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                  opacity: { duration: 0.15 },
                }}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 w-56"
                layout="position"
                layoutId="controls-panel"
              >
                <motion.div className="space-y-4" layout>
                  <motion.div className="space-y-2" layout>
                    <motion.div
                      className="flex items-center justify-between"
                      layout
                    >
                      <motion.span
                        className="text-base font-medium text-slate-700"
                        layout
                      >
                        Movement:
                      </motion.span>
                    </motion.div>

                    <motion.div
                      className="grid grid-cols-3 gap-1.5 place-items-center"
                      layout
                    >
                      <div></div>
                      <KeyButton>W</KeyButton>
                      <div></div>

                      <KeyButton>A</KeyButton>
                      <KeyButton>S</KeyButton>
                      <KeyButton>D</KeyButton>
                    </motion.div>

                    <motion.div
                      className="flex items-center justify-between mt-3"
                      layout
                    >
                      <motion.span
                        className="text-base font-medium text-slate-700"
                        layout
                      >
                        Up / Down:
                      </motion.span>
                    </motion.div>

                    <motion.div className="flex gap-1.5 justify-center" layout>
                      <KeyButton wide>Space</KeyButton>
                      <KeyButton wide>Shift</KeyButton>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </div>
  );
}
