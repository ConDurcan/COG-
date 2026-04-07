// I use these test helpers to render the screen and await async UI updates.
import { fireEvent, render, waitFor } from "@testing-library/react-native";

// PermissionStatus builds realistic permission responses in mocks.
import { PermissionStatus } from "expo-modules-core";

// The real Pedometer module talks to native hardware; we replace it with a mock below.
import { Pedometer } from "expo-sensors";

import { AuthProvider } from "@/context/auth-context";

// I test the Activity tab screen in this file.
import ActivityScreen from "../app/(tabs)/explore";

const renderActivityScreen = () =>
  render(
    <AuthProvider>
      <ActivityScreen />
    </AuthProvider>,
  );

// ─── Mock setup ───────────────────────────────────────────────────────────────
// I replace expo-sensors with a controlled mock implementation for each test.
jest.mock("expo-sensors", () => ({
  Pedometer: {
    // jest.fn() creates a spy function; we can set its return value per test.
    requestPermissionsAsync: jest.fn(),
    getStepCountAsync: jest.fn(),
  },
}));

jest.mock("@/services/auth-service", () => ({
  AuthService: {
    logout: jest.fn(),
    restoreUser: jest.fn().mockResolvedValue(null),
  },
}));

// I cast to jest.Mocked so TypeScript exposes mock helpers on these methods.
const pedometerMock = Pedometer as jest.Mocked<typeof Pedometer>;

// Type derived from the source API so the helper stays in sync.
type PedometerPermissionResponse = Awaited<
  ReturnType<typeof Pedometer.requestPermissionsAsync>
>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
// I build a complete, typed permission payload for granted and denied flows.
const createPermissionResponse = (
  granted: boolean,
): PedometerPermissionResponse => ({
  granted,
  status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
  // canAskAgain is false when denied — the OS won't show the prompt again.
  canAskAgain: !granted,
  // 'never' means the permission does not expire.
  expires: "never",
});

// ─── Test suite ───────────────────────────────────────────────────────────────
// Grouped behavior checks for loading, denied permission, and successful reads.
describe("ActivityScreen", () => {
  // I reset all mocks so each test starts with a clean state.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Test 1: Loading state ──────────────────────────────────────────────────
  // Verify the initial loading UI while permissions are still pending.
  it("shows loading state initially", () => {
    // I keep this promise unresolved to hold the screen in loading mode.
    pedometerMock.requestPermissionsAsync.mockReturnValue(
      new Promise(() => {}),
    );

    // Use getByText for immediate, synchronous assertions.
    const { getByText } = renderActivityScreen();

    expect(getByText("TODAY'S STEPS")).toBeTruthy();
    expect(getByText("Loading...")).toBeTruthy();
  });

  // ── Test 2: Permission denied ──────────────────────────────────────────────
  // Verify the denied path shows an error and skips step retrieval.
  it("shows permission denied when permission is not granted", async () => {
    // Resolve this mock to simulate an async permission response.
    pedometerMock.requestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(false),
    );

    // Use findByText to wait for UI changes triggered by async effects.
    const { findByText } = renderActivityScreen();

    expect(await findByText("Permission denied")).toBeTruthy();
    // Expect no step API call when permission is denied.
    expect(pedometerMock.getStepCountAsync).not.toHaveBeenCalled();
  });

  // ── Test 3: Successful step count ─────────────────────────────────────────
  // Verify successful permission + pedometer flow and final formatted output.
  it("shows step count when permission is granted", async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(true),
    );
    // Returns a known step value so formatting is easy to assert.
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByText, queryByText } = renderActivityScreen();

    // waitFor keeps polling the callbacks until it stops throwing.
    // This waits for the entire async effect chain to complete (permissions → step query).
    await waitFor(() => {
      expect(pedometerMock.getStepCountAsync).toHaveBeenCalledTimes(1);
    });

    // The step count should now be formatted and visible.
    expect(await findByText("1,234")).toBeTruthy();
    // Loading text should disappear once data has rendered.
    expect(queryByText("Loading...")).toBeNull();
  });

  it("shows default steps left based on default goal", async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(true),
    );
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByText } = renderActivityScreen();

    expect(await findByText("8,766")).toBeTruthy();
  });

  it("updates steps left when user changes goal", async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(true),
    );
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByLabelText, findByText } = renderActivityScreen();

    const input = await findByLabelText("Step goal");
    fireEvent.changeText(input, "9000");

    expect(await findByText("7,766")).toBeTruthy();
  });

  it("never shows negative steps left", async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(
      createPermissionResponse(true),
    );
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByLabelText, findByText } = renderActivityScreen();

    const input = await findByLabelText("Step goal");
    fireEvent.changeText(input, "1000");

    expect(await findByText("0")).toBeTruthy();
  });
});
