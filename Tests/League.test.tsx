import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import League from '../app/League';

// Mock the Clipboard module
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
}));
import Clipboard from '@react-native-clipboard/clipboard';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Advance to Step 2 by filling the league name and tapping Continue. */
const goToStep2 = (getByPlaceholderText: Function, getByText: Function) =>  {
  fireEvent.changeText(
    getByPlaceholderText('e.g. Office Walkers 2024'),
    'Test League',
  );
  fireEvent.press(getByText('Continue → Invite Friends'));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('League component', () => {

  // ── Initial render ──────────────────────────────────────────────────────────

  it('renders Step 1 on mount', () => {
    const { getByText } = render(<League />);
    expect(getByText('Create a League')).toBeTruthy();
    expect(getByText('Step 1 of 3 — League Setup')).toBeTruthy();
  });

  it('shows the Continue button disabled-looking when league name is empty', () => {
    const { getByText } = render(<League />);
    // Button is present but pressing it with an empty name should not advance
    fireEvent.press(getByText('Continue → Invite Friends'));
    expect(getByText('Create a League')).toBeTruthy(); // still on step 1
  });

  // ── Step 1 interactions ─────────────────────────────────────────────────────

  it('advances to Step 2 when a league name is entered and Continue is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);
    expect(getByText('Invite Your Crew')).toBeTruthy();
    expect(getByText('Step 2 of 3 — Invite Friends')).toBeTruthy();
  });

  it('updates the duration pill selection', () => {
    const { getByText } = render(<League />);
    fireEvent.press(getByText('1 Month'));
    // The pill renders the same label — just verify no crash and it's still visible
    expect(getByText('1 Month')).toBeTruthy();
  });

  it('updates the win condition pill selection', () => {
    const { getByText } = render(<League />);
    fireEvent.press(getByText('First to 100K'));
    expect(getByText('First to 100K')).toBeTruthy();
  });

  it('opens and closes the avatar picker', () => {
    const { getByText } = render(<League />);
    fireEvent.press(getByText('Tap to change icon'));
    expect(getByText('🏃')).toBeTruthy(); // grid is visible

    fireEvent.press(getByText('🏃')); // selecting closes the picker
    // After selection the grid should be gone; pressing again would reopen it
  });

  it('updates the step target input', () => {
    const { getByPlaceholderText } = render(<League />);
    const input = getByPlaceholderText('10000');
    fireEvent.changeText(input, '8000');
    expect(input.props.value).toBe('8000');
  });

  // ── Step 2 interactions ─────────────────────────────────────────────────────

  it('adds an invite email and shows it as a chip', () => {
    const { getByPlaceholderText, getByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);

    fireEvent.changeText(
      getByPlaceholderText('friend@example.com'),
      'alice@example.com',
    );
    fireEvent.press(getByText('+'));
    expect(getByText('alice@example.com')).toBeTruthy();
  });

  it('does not add a duplicate invite email', () => {
    const { getByPlaceholderText, getByText, getAllByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);

    const emailInput = getByPlaceholderText('friend@example.com');
    const addBtn = getByText('+');

    fireEvent.changeText(emailInput, 'alice@example.com');
    fireEvent.press(addBtn);
    fireEvent.changeText(emailInput, 'alice@example.com');
    fireEvent.press(addBtn);

    // Should appear exactly once
    expect(getAllByText('alice@example.com')).toHaveLength(1);
  });

  it('removes an invite email when × is tapped', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);

    fireEvent.changeText(
      getByPlaceholderText('friend@example.com'),
      'bob@example.com',
    );
    fireEvent.press(getByText('+'));
    expect(getByText('bob@example.com')).toBeTruthy();

    fireEvent.press(getByText('×'));
    expect(queryByText('bob@example.com')).toBeNull();
  });

  it('copies the league code to clipboard when Copy Code is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);

    fireEvent.press(getByText('Copy Code'));
    expect(Clipboard.setString).toHaveBeenCalledTimes(1);
    // The code starts with STRIDE-
    const calledWith = (Clipboard.setString as jest.Mock).mock.calls[0][0] as string;
    expect(calledWith).toMatch(/^STRIDE-/);
  });

  it('shows ✓ Copied! briefly after copying', () => {
    jest.useFakeTimers();
    const { getByPlaceholderText, getByText, queryByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);

    fireEvent.press(getByText('Copy Code'));
    expect(getByText('✓ Copied!')).toBeTruthy();

    act(() => jest.advanceTimersByTime(2001));
    expect(queryByText('✓ Copied!')).toBeNull();
    jest.useRealTimers();
  });

  it('navigates back to Step 1 when Back is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);

    fireEvent.press(getByText('Back'));
    expect(getByText('Create a League')).toBeTruthy();
  });

  // ── Step 3 ──────────────────────────────────────────────────────────────────

  it('advances to Step 3 when Launch League is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);
    fireEvent.press(getByText('Launch League →'));
    expect(getByText('League is Ready 🎉')).toBeTruthy();
    expect(getByText('✦ League Created Successfully')).toBeTruthy();
  });

  it('shows invited emails as success chips on Step 3', () => {
    const { getByPlaceholderText, getByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);

    fireEvent.changeText(
      getByPlaceholderText('friend@example.com'),
      'carol@example.com',
    );
    fireEvent.press(getByText('+'));

    fireEvent.press(getByText('Send 1 Invite & Launch'));
    expect(getByText('✓ carol@example.com')).toBeTruthy();
  });

  it('resets to Step 1 when Create Another League is pressed', () => {
    const { getByPlaceholderText, getByText } = render(<League />);
    goToStep2(getByPlaceholderText, getByText);
    fireEvent.press(getByText('Launch League →'));
    fireEvent.press(getByText('+ Create Another League'));

    expect(getByText('Create a League')).toBeTruthy();
    // Name input should be cleared
    expect(getByPlaceholderText('e.g. Office Walkers 2024').props.value).toBe('');
  });
});