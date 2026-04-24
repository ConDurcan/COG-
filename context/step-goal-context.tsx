import { STEP_GOAL_STEPS } from "@/constants/step-goal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STEP_GOAL_STORAGE_KEY = "compfit.stepGoal";

interface StepGoalContextValue {
  stepGoal: number;
  isHydrating: boolean;
  setStepGoal: (stepGoal: number) => Promise<void>;
}

const StepGoalContext = createContext<StepGoalContextValue | undefined>(undefined);

export function StepGoalProvider({ children }: { children: React.ReactNode }) {
  const [stepGoal, setStepGoalState] = useState(STEP_GOAL_STEPS);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const restoreStepGoal = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(STEP_GOAL_STORAGE_KEY);
        const parsedValue = storedValue ? Number.parseInt(storedValue, 10) : STEP_GOAL_STEPS;

        if (isMounted && Number.isFinite(parsedValue) && parsedValue > 0) {
          setStepGoalState(parsedValue);
        }
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    };

    void restoreStepGoal();

    return () => {
      isMounted = false;
    };
  }, []);

  const setStepGoal = async (value: number) => {
    const normalizedValue = Number.isFinite(value) && value > 0 ? Math.floor(value) : STEP_GOAL_STEPS;
    setStepGoalState(normalizedValue);

    try {
      await AsyncStorage.setItem(STEP_GOAL_STORAGE_KEY, String(normalizedValue));
    } catch (error) {
      console.error("Error saving step goal:", error);
    }
  };

  return (
    <StepGoalContext.Provider value={{ stepGoal, isHydrating, setStepGoal }}>
      {children}
    </StepGoalContext.Provider>
  );
}

export function useStepGoal() {
  const context = useContext(StepGoalContext);

  if (context === undefined) {
    throw new Error("useStepGoal must be used inside a <StepGoalProvider>");
  }

  return context;
}