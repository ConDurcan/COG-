import { render } from "@testing-library/react-native";

import TabLayout from "@/app/(tabs)/_layout";
import { useAuth } from "@/hooks/use-auth";

jest.mock("expo-router", () => {
  const { Text: MockText } = require("react-native");

  const Tabs = Object.assign(
    ({ children }: { children: React.ReactNode }) => <>{children}</>,
    {
      Screen: ({
        name,
        options,
      }: {
        name: string;
        options: { title: string };
      }) => <MockText>{`TAB:${name}:${options.title}`}</MockText>,
    },
  );

  return {
    Tabs,
  };
});

jest.mock("@/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/use-color-scheme", () => ({
  useColorScheme: () => "light",
}));

const mockedUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("TabLayout integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the Home and Activity tabs for signed-in users", () => {
    mockedUseAuth.mockReturnValue({
      user: {
        id: "user-1",
        email: "alex@example.com",
        displayName: "Alex",
        createdAt: "2026-03-18T09:00:00Z",
        metrics: [],
        leagueHistory: [],
      },
      setUser: jest.fn(),
      isLoggedIn: true,
      isHydrating: false,
    });

    const { getByText } = render(<TabLayout />);

    expect(getByText("TAB:index:Home")).toBeTruthy();
    expect(getByText("TAB:explore:Activity")).toBeTruthy();
  });
});
