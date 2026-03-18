// render: mounts a component into a virtual DOM so we can query its output.
// waitFor: retries an assertion on a short interval until it passes or times out —
//          useful when state updates happen asynchronously (e.g. after an awaited API call).
import { fireEvent, render, waitFor } from '@testing-library/react-native';

// PermissionStatus is an enum (GRANTED, DENIED, …) used by all Expo permissions APIs.
import { PermissionStatus } from 'expo-modules-core';

// The real Pedometer module talks to native hardware; we replace it with a mock below.
import { Pedometer } from 'expo-sensors';

// The component under test.
import HomeScreen from '../app/(tabs)/index';

// ─── Mock setup ───────────────────────────────────────────────────────────────
// jest.mock() intercepts the module import and replaces it with our factory.
// Every test in this file will receive this fake Pedometer instead of the real one,
// so tests run without any native hardware and the results are fully controlled.
jest.mock('expo-sensors', () => ({
  Pedometer: {
    // jest.fn() creates a spy function; we can set its return value per test.
    requestPermissionsAsync: jest.fn(),
    getStepCountAsync: jest.fn(),
  },
}));

// Cast to jest.Mocked so TypeScript knows these functions have mock helpers
// like .mockResolvedValue() and .mockReturnValue().
const pedometerMock = Pedometer as jest.Mocked<typeof Pedometer>;

// Derive the exact return type that requestPermissionsAsync resolves to,
// so our helper below is always in sync with the real API signature.
type PedometerPermissionResponse = Awaited<ReturnType<typeof Pedometer.requestPermissionsAsync>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Builds a complete, correctly typed permission response object.
// Passing `granted: true` simulates the user approving the permission prompt;
// `granted: false` simulates the user denying it.
const createPermissionResponse = (granted: boolean): PedometerPermissionResponse => ({
  granted,
  status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
  // canAskAgain is false when denied — the OS won't show the prompt again.
  canAskAgain: !granted,
  // 'never' means the permission does not expire.
  expires: 'never',
});

// ─── Test suite ───────────────────────────────────────────────────────────────
// describe() groups related tests under a shared label shown in test output.
describe('HomeScreen', () => {

  // beforeEach runs before every individual test (it/test block).
  // Clearing mocks resets call counts and return values so tests don't bleed into each other.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Test 1: Loading state ──────────────────────────────────────────────────
  // When the component first mounts, the pedometer request is still in flight.
  // We verify that the UI shows the heading and "Loading…" placeholder.
  it('shows loading state initially', () => {
    // new Promise(() => {}) never resolves, so requestPermissionsAsync stays pending.
    // This keeps the component in its initial loading state for the duration of the test.
    pedometerMock.requestPermissionsAsync.mockReturnValue(new Promise(() => {}));

    // render() mounts the component; getByText() throws if the text is not found.
    const { getByText } = render(<HomeScreen />);

    expect(getByText("TODAY'S STEPS")).toBeTruthy();
    expect(getByText('Loading...')).toBeTruthy();
  });

  // ── Test 2: Permission denied ──────────────────────────────────────────────
  // When the user refuses the permission, the component must show an error message
  // and must NOT attempt to read the step count.
  it('shows permission denied when permission is not granted', async () => {
    // mockResolvedValue wraps the value in a resolved Promise, simulating an async response.
    pedometerMock.requestPermissionsAsync.mockResolvedValue(createPermissionResponse(false));

    // findByText is like getByText but returns a Promise — it waits for the element
    // to appear after state updates triggered by the resolved permission response.
    const { findByText } = render(<HomeScreen />);

    expect(await findByText('Permission denied')).toBeTruthy();
    // If permission was denied, the step-count API should never be called.
    expect(pedometerMock.getStepCountAsync).not.toHaveBeenCalled();
  });

  // ── Test 3: Successful step count ─────────────────────────────────────────
  // When both permission and the pedometer call succeed, the formatted step count
  // must be displayed and the loading text must be gone.
  it('shows step count when permission is granted', async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(createPermissionResponse(true));
    // Return 1 234 steps; the component formats this with toLocaleString() → "1,234".
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByText, queryByText } = render(<HomeScreen />);

    // waitFor keeps polling the callback until it stops throwing.
    // This waits for the entire async effect chain to complete (permissions → step query).
    await waitFor(() => {
      expect(pedometerMock.getStepCountAsync).toHaveBeenCalledTimes(1);
    });

    // The step count should now be formatted and visible.
    expect(await findByText('1,234')).toBeTruthy();
    // queryByText returns null instead of throwing when the element is absent.
    expect(queryByText('Loading...')).toBeNull();
  });

  it('shows default steps left based on default goal', async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(createPermissionResponse(true));
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByText } = render(<HomeScreen />);

    expect(await findByText('8,766')).toBeTruthy();
  });

  it('updates steps left when user changes goal', async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(createPermissionResponse(true));
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByLabelText, findByText } = render(<HomeScreen />);

    const input = await findByLabelText('Step goal');
    fireEvent.changeText(input, '9000');

    expect(await findByText('7,766')).toBeTruthy();
  });

  it('never shows negative steps left', async () => {
    pedometerMock.requestPermissionsAsync.mockResolvedValue(createPermissionResponse(true));
    pedometerMock.getStepCountAsync.mockResolvedValue({ steps: 1234 });

    const { findByLabelText, findByText } = render(<HomeScreen />);

    const input = await findByLabelText('Step goal');
    fireEvent.changeText(input, '1000');

    expect(await findByText('0')).toBeTruthy();
  });
});
