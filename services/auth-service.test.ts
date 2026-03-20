jest.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      updateUser: jest.fn(),
    },
  },
}));

import { supabase } from "@/lib/supabase";
import { AuthService } from "@/services/auth-service";

const mockedSupabase = supabase as unknown as {
  auth: {
    signUp: jest.Mock;
    signInWithPassword: jest.Mock;
    signOut: jest.Mock;
    getUser: jest.Mock;
    updateUser: jest.Mock;
  };
};

describe("AuthService.signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a mapped user on successful signup", async () => {
    mockedSupabase.auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "alex@example.com",
          created_at: "2026-03-18T09:00:00Z",
          user_metadata: {
            display_name: "Alex",
          },
        },
      },
      error: null,
    });

    const result = await AuthService.signup({
      email: "Alex@Example.com",
      displayName: "Alex",
      password: "Password123",
    });

    expect(mockedSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "alex@example.com",
      password: "Password123",
      options: {
        data: {
          display_name: "Alex",
        },
      },
    });

    expect(result).toEqual({
      id: "user-1",
      email: "alex@example.com",
      displayName: "Alex",
      createdAt: "2026-03-18T09:00:00Z",
      metrics: [],
      leagueHistory: [],
    });
  });

  it("throws for invalid signup email before calling Supabase", async () => {
    await expect(
      AuthService.signup({
        email: "not-an-email",
        displayName: "Alex",
        password: "Password123",
      }),
    ).rejects.toThrow("Please enter a valid email address");

    expect(mockedSupabase.auth.signUp).not.toHaveBeenCalled();
  });

  it("throws for a too-short signup password before calling Supabase", async () => {
    await expect(
      AuthService.signup({
        email: "alex@example.com",
        displayName: "Alex",
        password: "123",
      }),
    ).rejects.toThrow("Password should be at least 6 characters");

    expect(mockedSupabase.auth.signUp).not.toHaveBeenCalled();
  });
});

describe("AuthService.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns a mapped user on successful login", async () => {
    mockedSupabase.auth.signInWithPassword.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "alex@example.com",
          created_at: "2026-03-18T09:00:00Z",
          user_metadata: {
            display_name: "Alex",
          },
        },
      },
      error: null,
    });

    const result = await AuthService.login({
      email: "Alex@Example.com",
      password: "Password123",
    });

    expect(mockedSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "alex@example.com",
      password: "Password123",
    });

    expect(result).toEqual({
      id: "user-1",
      email: "alex@example.com",
      displayName: "Alex",
      createdAt: "2026-03-18T09:00:00Z",
      metrics: [],
      leagueHistory: [],
    });
  });

  it("throws for invalid login email before calling Supabase", async () => {
    await expect(
      AuthService.login({
        email: "bad-email",
        password: "Password123",
      }),
    ).rejects.toThrow("Please enter a valid email address");

    expect(mockedSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("throws when attempting to log in with no password", async () => {
    await expect(
      AuthService.login({
        email: "alex@example.com",
        password: "",
      }),
    ).rejects.toThrow("Please enter a password");

    expect(mockedSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});
