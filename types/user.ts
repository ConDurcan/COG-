export type UserMetricKey =
  | "leagueWinCount"
  | "dailyStepCount"
  | "leaguePosition"
  | "highestStepCount"
  | "totalStepCount"
  | "activeDaysCount"
  | "currentStreakCount"
  | "longestStreakCount"
  | "weeklyStepCount";

export interface UserMetricEntry {
  key: UserMetricKey;
  value: number;
  unit: string;
  recordedAt: string;
}

export interface LeagueResult {
  id: string;
  leagueId: string;
  seasonLabel: string;
  rank: number;
  points: number;
  completedAt: string;
}

export interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  metrics: UserMetricEntry[];
  leagueHistory: LeagueResult[];
}
