import { render, screen } from "@testing-library/react-native";
import { describe, expect, it, jest } from "@jest/globals";

import HomeScreen from "@/app/(tabs)/index";

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: () => "light",
}));

describe("HomeScreen leaderboard UI", () => {
  it("shows leaderboard heading and sorted ranking rows", () => {
    render(<HomeScreen />);

    expect(screen.getByText("Leaderboard")).toBeTruthy();
    expect(screen.getByTestId("rank-name-1").props.children).toBe("Mia");
    expect(screen.getByTestId("rank-name-2").props.children).toBe("You");
    expect(screen.getByTestId("rank-name-3").props.children).toBe("Luca");
  });

  it("shows live race gap text", () => {
    render(<HomeScreen />);

    expect(screen.getByText("You are 788 steps behind Mia.")).toBeTruthy();
  });
});
