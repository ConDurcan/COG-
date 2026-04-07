import {
  DAILY_GOAL,
  buildLeaderboardState,
  competitors,
  formatSteps,
  type Competitor,
} from "@/app/(tabs)/leaderboard-utils";
import { describe, expect, it } from "@jest/globals";

describe("leaderboard utils", () => {
  it("sorts competitors by descending steps", () => {
    const state = buildLeaderboardState(competitors);
    const orderedNames = state.sorted.map((person) => person.name);

    expect(orderedNames).toEqual(["Mia", "You", "Luca", "Amara", "Jake", "Noor"]);
  });

  it("calculates rank and distance metrics for You", () => {
    const state = buildLeaderboardState(competitors);

    expect(state.yourRank).toBe(2);
    expect(state.leader.name).toBe("Mia");
    expect(state.rival.name).toBe("Mia");
    expect(state.rivalDistance).toBe(788);
    expect(state.leaderDistance).toBe(788);
  });

  it("caps progress values at 100%", () => {
    const highStepData: Competitor[] = [
      { id: 10, name: "You", steps: DAILY_GOAL + 2500, streak: 1, isOnline: true },
      { id: 11, name: "Alex", steps: DAILY_GOAL + 5000, streak: 1, isOnline: true },
    ];

    const state = buildLeaderboardState(highStepData);

    expect(state.youProgress).toBe(100);
    expect(state.rivalProgress).toBe(100);
  });

  it("formats steps with locale separators", () => {
    expect(formatSteps(12000)).toBe("12,000");
  });
});
