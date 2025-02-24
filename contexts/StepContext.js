"use client";

import { createContext, useContext, useState } from "react";

export const Steps = {
  IDLE: "IDLE",
  WORK_EXPERIENCE: "WORK_EXPERIENCE",
  PROJECTS: "PROJECTS",
  CONTACT: "CONTACT",
};

const StepContext = createContext();

export function StepProvider({ children }) {
  const [currentStep, setCurrentStep] = useState(Steps.IDLE);

  return (
    <StepContext.Provider value={{ currentStep, setCurrentStep }}>
      {children}
    </StepContext.Provider>
  );
}

export function useStep() {
  const context = useContext(StepContext);
  if (context === undefined) {
    throw new Error("useStep must be used within a StepProvider");
  }
  return context;
}
