import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

type DayStepPoint = {
  day: string;
  steps: number;
};

type ChartBarPoint = {
  key: string;
  day: string;
  heightPercent: number;
  steps: number;
};

type ChartModel = {
  bars: ChartBarPoint[];
  goal: number;
  goalPercent: number;
  max: number;
};

const DEFAULT_GOAL = 8000;

// Placeholder source data. Replace with real history from backend later.
const mockWeek: DayStepPoint[] = [
  { day: "Mon", steps: 2200 },
  { day: "Tue", steps: 4100 },
  { day: "Wed", steps: 3700 },
  { day: "Thu", steps: 5200 },
  { day: "Fri", steps: 6800 },
  { day: "Sat", steps: 7400 },
  { day: "Sun", steps: 6100 },
];

export default function ProfileScreen() {
  // Build a chart-ready model from the current data source.
  const chart = buildChartModel(mockWeek, DEFAULT_GOAL);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">My Stats</ThemedText>
      <ThemedText>skeleton (using mock data "logic may be changed")</ThemedText>

      <View style={styles.metaRow}>
        <ThemedText style={styles.metaText}>Goal: {chart.goal}</ThemedText>
        <ThemedText style={styles.metaText}>Max: {chart.max}</ThemedText>
      </View>

      <View style={styles.chartBox}>
        {/* Horizontal goal reference line */}
        <View style={[styles.goalLine, { top: `${100 - chart.goalPercent}%` }]} />
        <View style={styles.pointsRow}>
          {chart.bars.map((bar) => (
            <View key={bar.key} style={styles.barWrap}>
              {/* Daily steps visualized as a vertical bar */}
              <View
                style={[
                  styles.point,
                  {
                    height: `${bar.heightPercent}%`,
                  },
                ]}
              />
              <ThemedText style={styles.dayLabel}>{bar.day}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

function buildChartModel(series: DayStepPoint[], goal: number): ChartModel {
  // Normalize values so both bars and goal line share the same scale.
  const safeGoal = Math.max(goal, 1);
  const maxSteps = Math.max(...series.map((point) => point.steps), safeGoal, 1);

  const bars = series.map((point) => ({
    key: point.day,
    day: point.day,
    steps: point.steps,
    heightPercent: toPercent(point.steps, maxSteps),
  }));

  return {
    bars,
    goal: safeGoal,
    goalPercent: toPercent(safeGoal, maxSteps),
    max: maxSteps,
  };
}

function toPercent(value: number, max: number): number {
  return (Math.max(value, 0) / Math.max(max, 1)) * 100;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  metaText: {
    fontSize: 13,
    opacity: 0.8,
  },
  chartBox: {
    borderColor: "#d0d0d0",
    borderRadius: 8,
    borderWidth: 1,
    height: 210,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: "relative",
  },
  goalLine: {
    borderColor: "#ff7a00",
    borderStyle: "dashed",
    borderTopWidth: 2,
    left: 0,
    position: "absolute",
    right: 0,
  },
  pointsRow: {
    alignItems: "flex-end",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barWrap: {
    alignItems: "center",
    gap: 4,
  },
  point: {
    backgroundColor: "#0a7ea4",
    borderRadius: 6,
    minHeight: 6,
    width: 12,
  },
  dayLabel: {
    fontSize: 10,
    opacity: 0.8,
  },
});
