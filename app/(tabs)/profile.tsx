import { Pedometer } from "expo-sensors";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { StepsLineChart } from "@/components/steps-line-chart";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthService, DailyStepPoint } from "@/services/auth-service";

const GOAL_STEPS = 10000;
const HISTORY_DAYS = 7;

export default function ProfileScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DailyStepPoint[]>([]);

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
        const points = await AuthService.getDailyStepHistory(user.id, HISTORY_DAYS);
        const liveTodaySteps = await getTodayLiveSteps();
        const mergedPoints = mergeTodaySteps(points, liveTodaySteps);

        if (isMounted) {
          setHistory(mergedPoints);
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
  }, [user]);

  const currentSteps = useMemo(() => {
    if (history.length === 0) {
      return 0;
    }

    return history[history.length - 1]?.steps ?? 0;
  }, [history]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Profile</ThemedText>
      <ThemedText style={styles.subtitle}>Steps trend from the last 7 days</ThemedText>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendSwatch, { backgroundColor: palette.tint }]} />
          <ThemedText style={styles.legendText}>Your steps</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendGoalLine, { borderColor: "#ff7a00" }]} />
          <ThemedText style={styles.legendText}>Goal: {GOAL_STEPS.toLocaleString()}</ThemedText>
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
            points={history.map((point) => ({ label: point.label, value: point.steps }))}
            goalValue={GOAL_STEPS}
            lineColor={palette.tint}
            goalLineColor="#ff7a00"
            axisColor={palette.icon}
            labelColor={palette.text}
          />

          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Current: {currentSteps.toLocaleString()}</ThemedText>
            <ThemedText type="defaultSemiBold">
              Gap: {Math.max(GOAL_STEPS - currentSteps, 0).toLocaleString()}
            </ThemedText>
          </View>
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
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
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
});
