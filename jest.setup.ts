import { jest } from "@jest/globals";

jest.mock("expo-font", () => ({
  useFonts: () => [true],
}));
