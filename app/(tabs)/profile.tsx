import * as Linking from "expo-linking";
import { Pedometer } from "expo-sensors";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, View } from "react-native";

import { StepsLineChart } from "@/components/steps-line-chart";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useStepGoal } from "@/context/step-goal-context";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthService, DailyStepPoint } from "@/services/auth-service";

const HISTORY_DAYS = 7;
const HISTORY_RANGE_OPTIONS = [7, 30, 90] as const;

export default function ProfileScreen() {
  const { user } = useAuth();
  const { stepGoal } = useStepGoal();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DailyStepPoint[]>([]);
  const [streak, setStreak] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedHistoryDays, setSelectedHistoryDays] = useState<number>(HISTORY_DAYS);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!user) {
        if (isMounted) {
          setHistory([]);
          setError("You need to be logged in to view profile stats.");
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const points = await AuthService.getDailyStepHistory(user.id, selectedHistoryDays);
        const liveTodaySteps = await getTodayLiveSteps();
        const mergedPoints = mergeTodaySteps(points, liveTodaySteps);
        const currentStreakCount = await AuthService.getCurrentStreakCount(
          user.id,
          stepGoal,
        );

        if (isMounted) {
          setHistory(mergedPoints);
          setStreak(currentStreakCount);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load your step history.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [selectedHistoryDays, stepGoal, user]);

  const labelStride = useMemo(() => {
    if (history.length <= 10) {
      return 1;
    }

    if (history.length <= 45) {
      return 4;
    }

    return 9;
  }, [history.length]);

  const currentSteps = useMemo(() => {
    if (history.length === 0) {
      return 0;
    }

    return history[history.length - 1]?.steps ?? 0;
  }, [history]);

  const handleShareProgress = async () => {
    if (!user) {
      Alert.alert("Sign in required", "Please sign in before sharing progress.");
      return;
    }

    try {
      setIsSharing(true);
      const shareCode = await AuthService.createOrGetProgressShareCode(user.id);
      const shareUrl = Linking.createURL(`/share/${shareCode}`);

      await Share.share({
        message: `Track my Compfit progress: ${shareUrl}`,
      });
    } catch (shareError) {
      try {
        Alert.alert(
          "Link share unavailable",
          "We could not create a live share link. Using fallback snapshot sharing instead.",
        );

        const historySummary = history
          .slice(-selectedHistoryDays)
          .map((point) => `${point.label} ${point.date}: ${point.steps.toLocaleString()}`)
          .join("\n");

        await Share.share({
          message: [
            "My Compfit progress snapshot",
            `Current steps: ${currentSteps.toLocaleString()}`,
            `Streak: ${streak} days`,
            `Last ${selectedHistoryDays} days:`,
            historySummary,
          ].join("\n"),
        });
      } catch {
        const message =
          shareError instanceof Error ? shareError.message : "Could not share your progress right now.";
        Alert.alert("Share failed", message);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText style={styles.subtitle}>
        Steps trend from the last {selectedHistoryDays} days
      </ThemedText>

      <View style={styles.rangeControlsRow}>
        <ThemedText style={styles.rangeControlsLabel}>Show past analytics</ThemedText>
        <View style={styles.rangeButtonsRow}>
          {HISTORY_RANGE_OPTIONS.map((rangeDays) => {
            const isSelected = selectedHistoryDays === rangeDays;

            return (
              <Pressable
                key={rangeDays}
                accessibilityRole="button"
                onPress={() => setSelectedHistoryDays(rangeDays)}
                style={[
                  styles.rangeButton,
                  isSelected && styles.rangeButtonSelected,
                ]}
              >
                <ThemedText
                  style={[
                    styles.rangeButtonText,
                    isSelected && styles.rangeButtonTextSelected,
                  ]}
                >
                  {rangeDays}D
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: palette.tint }]} />
          <ThemedText style={styles.legendText}>Your steps</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendGoalLine, { borderColor: "#ff7a00" }]} />
          <ThemedText style={styles.legendText}>Goal: {stepGoal.toLocaleString()}</ThemedText>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={palette.tint} />
          <ThemedText>Loading graph...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <ThemedText>{error}</ThemedText>
        </View>
      ) : (
        <>
          <StepsLineChart
            points={history.map((point) => ({
              label: point.label,
              value: point.steps,
              date: point.date,
            }))}
            goalValue={stepGoal}
            lineColor={palette.tint}
            goalLineColor="#ff7a00"
            axisColor={palette.icon}
            labelColor={palette.text}
            labelStride={labelStride}
          />

          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Current: {currentSteps.toLocaleString()}</ThemedText>
            <ThemedText type="defaultSemiBold">
              Gap: {Math.max(stepGoal - currentSteps, 0).toLocaleString()}
            </ThemedText>
          </View>

          <View style={styles.streakRow}>
            <ThemedText type="defaultSemiBold">Streak: {streak} days</ThemedText>
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={isSharing}
            onPress={handleShareProgress}
            style={[styles.shareButton, isSharing && styles.shareButtonDisabled]}
          >
            <ThemedText type="defaultSemiBold" style={styles.shareButtonText}>
              {isSharing ? "Preparing link..." : "Share progress"}
            </ThemedText>
          </Pressable>
        </>
      )}
    </ThemedView>
  );
}

async function getTodayLiveSteps(): Promise<number | null> {
  try {
    const { granted } = await Pedometer.requestPermissionsAsync();

    if (!granted) {
      return null;
    }

    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const result = await Pedometer.getStepCountAsync(start, end);
    return result.steps;
  } catch {
    return null;
  }
}

function mergeTodaySteps(points: DailyStepPoint[], liveTodaySteps: number | null): DailyStepPoint[] {
  if (liveTodaySteps === null) {
    return points;
  }

  const todayKey = toDateKey(new Date());
  let foundToday = false;

  const updatedPoints = points.map((point) => {
    if (point.date !== todayKey) {
      return point;
    }

    foundToday = true;

    return {
      ...point,
      steps: Math.max(point.steps, liveTodaySteps),
    };
  });

  if (foundToday) {
    return updatedPoints;
  }

  return [
    ...updatedPoints,
    {
      date: todayKey,
      label: new Date().toLocaleDateString(undefined, { weekday: "short" }),
      steps: liveTodaySteps,
    },
  ];
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 64,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  rangeControlsRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rangeControlsLabel: {
    fontSize: 13,
    opacity: 0.8,
  },
  rangeButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  rangeButton: {
    borderColor: "#4d4d4d",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rangeButtonSelected: {
    borderColor: "#2e7dff",
    backgroundColor: "#2e7dff",
  },
  rangeButtonText: {
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.9,
  },
  rangeButtonTextSelected: {
    color: "#ffffff",
    opacity: 1,
  },
  legendRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  legendItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  legendSwatch: {
    borderRadius: 8,
    height: 8,
    width: 16,
  },
  legendGoalLine: {
    borderTopWidth: 2,
    borderStyle: "dashed",
    width: 16,
  },
  legendText: {
    fontSize: 13,
  },
  stateContainer: {
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  streakRow: {
    marginTop: 8,
  },
  shareButton: {
    alignItems: "center",
    borderColor: "#2e7dff",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  shareButtonDisabled: {
    opacity: 0.6,
  },
  shareButtonText: {
    color: "#2e7dff",
  },
});
