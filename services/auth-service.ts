import { supabase } from "@/lib/supabase";
import { UserAccount } from "@/types/user";
import { User } from "@supabase/supabase-js";

// I keep auth input types here so service method signatures stay explicit.

export interface SignupInput {
  email: string;
  displayName: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Please enter a valid email address");
  }
}

function validatePassword(password: string, minimumLength = 6): void {
  if (password.trim().length === 0) {
    throw new Error("Please enter a password");
  }

  if (password.length < minimumLength) {
    throw new Error(`Password should be at least ${minimumLength} characters`);
  }
}

function mapSupabaseUserToUserAccount(user: User): UserAccount {
  return {
    id: user.id,
    email: user.email ?? "",
    displayName:
      typeof user.user_metadata?.display_name === "string" &&
      user.user_metadata.display_name.length > 0
        ? user.user_metadata.display_name
        : (user.email ?? "Compfit User"),
    createdAt: user.created_at,
    metrics: [],
    leagueHistory: [],
  };
}

// Centralized Supabase auth calls in this service.
// This gives screens a single interface for signup, login, restore, and logout.

export const AuthService = {
  // Sign up: create a new account
  async signup(input: SignupInput): Promise<UserAccount> {
    const normalizedEmail = normalizeEmail(input.email);
    validateEmail(normalizedEmail);
    validatePassword(input.password);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: input.password,
      options: {
        data: {
          display_name: input.displayName,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Signup failed: no user returned");
    }

    return mapSupabaseUserToUserAccount(data.user);
  },

  // Log in: load an existing account
  async login(input: LoginInput): Promise<UserAccount> {
    const normalizedEmail = normalizeEmail(input.email);
    validateEmail(normalizedEmail);
    validatePassword(input.password, 1);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: input.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error("Login failed: no user returned");
    }

    return mapSupabaseUserToUserAccount(data.user);
  },

  // Log out: clear the current session user
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  // Get stored accounts: return the current session user in list form for compatibility with caller expectations.
  async getStoredAccounts(): Promise<UserAccount[]> {
    const restored = await this.restoreUser();
    return restored ? [restored] : [];
  },

  // Load user by email if it's the currently authenticated account
  async loadUser(email: string): Promise<UserAccount | null> {
    try {
      const normalizedEmail = normalizeEmail(email);
      const restored = await this.restoreUser();
      if (!restored) return null;
      return restored.email === normalizedEmail ? restored : null;
    } catch (error) {
      console.error("Error loading user from storage:", error);
      return null;
    }
  },

  // Restore user state from Supabase when a valid session is present.
  async restoreUser(): Promise<UserAccount | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        return null;
      }

      if (!data.user) return null;
      return mapSupabaseUserToUserAccount(data.user);
    } catch (error) {
      console.error("Error restoring user:", error);
      return null;
    }
  },

  // Update user profile: update profile metadata and preserve local metrics/history fields.
  async updateUser(user: UserAccount): Promise<UserAccount> {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        display_name: user.displayName,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      return user;
    }

    const mapped = mapSupabaseUserToUserAccount(data.user);

    return {
      ...mapped,
      metrics: user.metrics,
      leagueHistory: user.leagueHistory,
    };
  },
};
