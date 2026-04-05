import { STEP_GOAL_STEPS } from "@/constants/step-goal";
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

export interface DailyStepSnapshotInput {
  userId: string;
  steps: number;
}

export interface DailyStepPoint {
  date: string;
  label: string;
  steps: number;
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

  async saveDailyStepSnapshot(input: DailyStepSnapshotInput): Promise<void> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const tomorrowStart = new Date(todayStart);
    tomorrowStart.setDate(todayStart.getDate() + 1);

    const { error: deleteError } = await supabase
      .from("user_metrics")
      .delete()
      .eq("user_id", input.userId)
      .eq("metric_key", "dailyStepCount")
      .gte("recorded_at", todayStart.toISOString())
      .lt("recorded_at", tomorrowStart.toISOString());

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    const { error: insertError } = await supabase.from("user_metrics").insert({
      user_id: input.userId,
      metric_key: "dailyStepCount",
      metric_value: input.steps,
      unit: "steps",
      recorded_at: new Date().toISOString(),
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    const streak = await calculateCurrentStreak(input.userId);

    const { error: deleteStreakError } = await supabase
      .from("user_metrics")
      .delete()
      .eq("user_id", input.userId)
      .eq("metric_key", "currentStreakCount")
      .gte("recorded_at", todayStart.toISOString())
      .lt("recorded_at", tomorrowStart.toISOString());

    if (deleteStreakError) {
      throw new Error(deleteStreakError.message);
    }

    const { error: insertStreakError } = await supabase.from("user_metrics").insert({
      user_id: input.userId,
      metric_key: "currentStreakCount",
      metric_value: streak,
      unit: "days",
      recorded_at: new Date().toISOString(),
    });

    if (insertStreakError) {
      throw new Error(insertStreakError.message);
    }
  },

  async getCurrentStreakCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from("user_metrics")
      .select("metric_value, recorded_at")
      .eq("user_id", userId)
      .eq("metric_key", "currentStreakCount")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      const parsed = Number(data.metric_value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return calculateCurrentStreak(userId);
  },

  async getDailyStepHistory(userId: string, days = 7): Promise<DailyStepPoint[]> {
    const safeDays = Math.max(days, 1);
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (safeDays - 1));

    const { data, error } = await supabase
      .from("user_metrics")
      .select("metric_value, recorded_at")
      .eq("user_id", userId)
      .eq("metric_key", "dailyStepCount")
      .gte("recorded_at", startDate.toISOString())
      .order("recorded_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const stepMap = new Map<string, number>();

    for (const row of data ?? []) {
      const dateKey = toDateKey(new Date(row.recorded_at));
      const parsedValue = Number(row.metric_value);
      const metricValue = Number.isFinite(parsedValue) ? parsedValue : 0;
      const previousValue = stepMap.get(dateKey) ?? 0;

      // Keep the largest value for a day in case multiple samples exist.
      stepMap.set(dateKey, Math.max(previousValue, metricValue));
    }

    const history: DailyStepPoint[] = [];

    for (let i = 0; i < safeDays; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateKey = toDateKey(date);

      history.push({
        date: dateKey,
        label: date.toLocaleDateString(undefined, { weekday: "short" }),
        steps: stepMap.get(dateKey) ?? 0,
      });
    }

    return history;
  },
};

async function calculateCurrentStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("user_metrics")
    .select("metric_value, recorded_at")
    .eq("user_id", userId)
    .eq("metric_key", "dailyStepCount")
    .order("recorded_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const stepByDate = new Map<string, number>();

  for (const row of data ?? []) {
    const dateKey = toDateKey(new Date(row.recorded_at));
    const parsedValue = Number(row.metric_value);
    const safeValue = Number.isFinite(parsedValue) ? parsedValue : 0;
    const previousValue = stepByDate.get(dateKey) ?? 0;
    stepByDate.set(dateKey, Math.max(previousValue, safeValue));
  }

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const dateKey = toDateKey(cursor);
    const steps = stepByDate.get(dateKey);

    if (steps === undefined || steps < STEP_GOAL_STEPS) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
