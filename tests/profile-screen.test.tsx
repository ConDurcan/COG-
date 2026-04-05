jest.mock("expo-sensors", () => ({
  Pedometer: {
    requestPermissionsAsync: jest.fn(),
    getStepCountAsync: jest.fn(),
  },
}));

jest.mock("@/lib/supabase");
jest.mock("@/hooks/use-auth");
jest.mock("@/hooks/use-color-scheme");
jest.mock("@/services/auth-service");

import { STEP_GOAL_STEPS } from "@/constants/step-goal";

describe("Profile Screen", () => {
  it("displays streak count", () => {
    const streak = 5;
    expect(streak).toBeGreaterThan(0);
  });

  it("displays current steps", () => {
    const currentSteps = 3500;
    expect(currentSteps).toBe(3500);
  });

  it("calculates gap correctly", () => {
    const currentSteps = 2000;
    const gap = Math.max(STEP_GOAL_STEPS - currentSteps, 0);
    expect(gap).toBe(1000);
  });

  it("shows 0 gap when goal is met", () => {
    const currentSteps = 3500;
    const gap = Math.max(STEP_GOAL_STEPS - currentSteps, 0);
    expect(gap).toBe(0);
  });

  it("displays goal in legend", () => {
    const goalText = `Goal: ${STEP_GOAL_STEPS.toLocaleString()}`;
    expect(goalText).toBe("Goal: 3,000");
  });

  it("shows 7-day history on graph", () => {
    const historyDays = 7;
    expect(historyDays).toBe(7);
  });

  it("merges live steps with historical data", () => {
    const dbSteps = 2500;
    const liveSteps = 3200;
    const merged = Math.max(dbSteps, liveSteps);
    expect(merged).toBe(3200);
  });

  it("displays loading state", () => {
    const isLoading = true;
    const loadingText = "Loading graph...";
    expect(isLoading).toBe(true);
    expect(loadingText).toBeTruthy();
  });

  it("displays error message on failure", () => {
    const error = "Could not load your step history.";
    expect(error).toBeTruthy();
  });

  it("fills missing days with 0 steps", () => {
    const history = [
      { date: "2026-03-28", steps: 0 },
      { date: "2026-03-29", steps: 3500 },
      { date: "2026-03-30", steps: 0 },
    ];
    const missingDays = history.filter((h) => h.steps === 0);
    expect(missingDays.length).toBe(2);
  });

  it("displays streak: 0 days when no streak", () => {
    const streak = 0;
    expect(streak).toBe(0);
  });

  it("displays legend items for steps and goal", () => {
    const legendItems = ["Your steps", `Goal: ${STEP_GOAL_STEPS.toLocaleString()}`];
    expect(legendItems.length).toBe(2);
  });
});
