import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Pedometer } from "expo-sensors";
import { useEffect } from "react";

import ActivityScreen from "@/app/(tabs)/explore";
import { AuthProvider } from "@/context/auth-context";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/services/auth-service";
import { UserAccount } from "@/types/user";

jest.mock("expo-router", () => {
  return {};
});

jest.mock("expo-sensors", () => ({
  Pedometer: {
    requestPermissionsAsync: jest.fn(),
    getStepCountAsync: jest.fn(),
  },
}));

jest.mock("@/services/auth-service", () => ({
  AuthService: {
    restoreUser: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockedRestoreUser = AuthService.restoreUser as jest.MockedFunction<
  typeof AuthService.restoreUser
>;
const mockedLogout = AuthService.logout as jest.MockedFunction<
  typeof AuthService.logout
>;
const mockedPedometer = Pedometer as jest.Mocked<typeof Pedometer>;

const mockUser: UserAccount = {
  id: "user-1",
  email: "alex@example.com",
  displayName: "Alex",
  createdAt: "2026-03-18T09:00:00Z",
  metrics: [],
  leagueHistory: [],
};

function SeedUser({ user }: { user: UserAccount }) {
  const { setUser } = useAuth();

  useEffect(() => {
    setUser(user);
  }, [setUser, user]);

  return null;
}

const renderActivityScreen = () =>
  render(
    <AuthProvider>
      <SeedUser user={mockUser} />
      <ActivityScreen />
    </AuthProvider>,
  );

describe("ActivityScreen logout integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRestoreUser.mockResolvedValue(null);
    mockedLogout.mockResolvedValue(undefined);
    mockedPedometer.requestPermissionsAsync.mockResolvedValue({
      granted: true,
    } as Awaited<ReturnType<typeof Pedometer.requestPermissionsAsync>>);
    mockedPedometer.getStepCountAsync.mockResolvedValue({ steps: 1234 });
  });

  it("shows the signed-in profile name", async () => {
    const { findByText } = renderActivityScreen();

    expect(await findByText(`PROFILE: ${mockUser.displayName}`)).toBeTruthy();
  });

  it("logs out and clears the user", async () => {
    const { findByText, getByText, queryByText } = renderActivityScreen();

    await findByText(`PROFILE: ${mockUser.displayName}`);
    fireEvent.press(getByText("LOG OUT"));

    await waitFor(() => {
      expect(mockedLogout).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(queryByText(`PROFILE: ${mockUser.displayName}`)).toBeNull();
    });
  });
});
