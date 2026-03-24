import { render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import { AuthProvider } from "@/context/auth-context";
import { useAuth } from "@/hooks/use-auth";
import { AuthService } from "@/services/auth-service";
import { UserAccount } from "@/types/user";

jest.mock("@/services/auth-service", () => ({
  AuthService: {
    restoreUser: jest.fn(),
  },
}));

const mockedRestoreUser = AuthService.restoreUser as jest.MockedFunction<
  typeof AuthService.restoreUser
>;

const mockUser: UserAccount = {
  id: "user-1",
  email: "alex@example.com",
  displayName: "Alex",
  createdAt: "2026-03-18T09:00:00Z",
  metrics: [],
  leagueHistory: [],
};

function AuthProbe() {
  const { isHydrating, isLoggedIn, user } = useAuth();

  return (
    <>
      <Text>{`hydrating:${String(isHydrating)}`}</Text>
      <Text>{`loggedIn:${String(isLoggedIn)}`}</Text>
      <Text>{`user:${user?.email ?? "none"}`}</Text>
    </>
  );
}

describe("AuthProvider integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("restores a saved session on startup", async () => {
    let resolveRestore!: (value: UserAccount | null) => void;

    mockedRestoreUser.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRestore = resolve;
      }),
    );

    const { getByText } = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(getByText("hydrating:true")).toBeTruthy();
    expect(getByText("loggedIn:false")).toBeTruthy();
    expect(getByText("user:none")).toBeTruthy();

    resolveRestore(mockUser);

    await waitFor(() => {
      expect(getByText("hydrating:false")).toBeTruthy();
      expect(getByText("loggedIn:true")).toBeTruthy();
      expect(getByText(`user:${mockUser.email}`)).toBeTruthy();
    });
  });

  it("finishes hydration with no restored session", async () => {
    mockedRestoreUser.mockResolvedValueOnce(null);

    const { getByText } = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByText("hydrating:false")).toBeTruthy();
      expect(getByText("loggedIn:false")).toBeTruthy();
      expect(getByText("user:none")).toBeTruthy();
    });
  });
});
