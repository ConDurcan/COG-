import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { StepsLineChart } from "@/components/steps-line-chart";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthService, PublicProgressSnapshot } from "@/services/auth-service";

export default function SharedProgressScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<PublicProgressSnapshot | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSnapshot = async () => {
      const shareCode = typeof code === "string" ? code : "";

      if (!shareCode) {
        if (isMounted) {
          setError("This shared progress link is invalid.");
          setIsLoading(false);
        }
        return;
      }

      try {
        setError(null);
        setIsLoading(true);
        const result = await AuthService.getPublicProgressByCode(shareCode);

        if (isMounted) {
          setSnapshot(result);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Could not load shared progress.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, [code]);

  const currentSteps = useMemo(() => {
    if (!snapshot || snapshot.history.length === 0) {
      return 0;
    }

    return snapshot.history[snapshot.history.length - 1]?.steps ?? 0;
  }, [snapshot]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Shared Progress</ThemedText>
      <ThemedText style={styles.subtitle}>
        {snapshot ? `${snapshot.displayName}'s last 7 days` : "Loading shared stats"}
      </ThemedText>

      {isLoading ? (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="small" color={palette.tint} />
          <ThemedText>Loading shared graph...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.stateContainer}>
          <ThemedText>{error}</ThemedText>
        </View>
      ) : snapshot ? (
        <>
          <StepsLineChart
            points={snapshot.history.map((point) => ({
              label: point.label,
              value: point.steps,
              date: point.date,
            }))}
            goalValue={Math.max(currentSteps, 1)}
            lineColor={palette.tint}
            goalLineColor="#6a7282"
            axisColor={palette.icon}
            labelColor={palette.text}
          />

          <View style={styles.summaryRow}>
            <ThemedText type="defaultSemiBold">Current: {currentSteps.toLocaleString()}</ThemedText>
            <ThemedText type="defaultSemiBold">Streak: {snapshot.streak} days</ThemedText>
          </View>
        </>
      ) : null}
    </ThemedView>
  );
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
