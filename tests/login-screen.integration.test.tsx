import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { AuthProvider } from "@/context/auth-context";
import LoginScreen from "@/app/index";
import { AuthService } from "@/services/auth-service";
import { UserAccount } from "@/types/user";

jest.mock("expo-router", () => {
  return {};
});

jest.mock("@/services/auth-service", () => ({
  AuthService: {
    restoreUser: jest.fn(),
    login: jest.fn(),
    signup: jest.fn(),
  },
}));

const mockedRestoreUser = AuthService.restoreUser as jest.MockedFunction<
  typeof AuthService.restoreUser
>;
const mockedLogin = AuthService.login as jest.MockedFunction<
  typeof AuthService.login
>;

const mockUser: UserAccount = {
  id: "user-1",
  email: "alex@example.com",
  displayName: "Alex",
  createdAt: "2026-03-18T09:00:00Z",
  metrics: [],
  leagueHistory: [],
};

const renderLoginScreen = () =>
  render(
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>,
  );

describe("LoginScreen integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows the login form when no session is restored", async () => {
    mockedRestoreUser.mockResolvedValueOnce(null);

    const { findByText, getByPlaceholderText } = renderLoginScreen();

    expect(await findByText("Compfit Login")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("redirects to tabs when a saved session exists", async () => {
    mockedRestoreUser.mockResolvedValueOnce(mockUser);

    const { queryByText } = renderLoginScreen();

    await waitFor(() => {
      expect(queryByText("Compfit Login")).toBeNull();
    });
  });

  it("logs in and redirects to tabs", async () => {
    mockedRestoreUser.mockResolvedValueOnce(null);
    mockedLogin.mockResolvedValueOnce(mockUser);

    const { getByPlaceholderText, getByText, findByText } = renderLoginScreen();

    await findByText("Compfit Login");

    fireEvent.changeText(getByPlaceholderText("Email"), "alex@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "Password123");
    fireEvent.press(getByText("Log In"));

    await waitFor(() => {
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "alex@example.com",
        password: "Password123",
      });
    });

    await waitFor(() => {
      expect(findByText("Compfit Login")).rejects.toThrow();
    });
  });
});
