import { ScrollView, StyleSheet, View } from "react-native";

import {
  buildLeaderboardState,
  competitors,
  formatSteps,
} from "@/app/(tabs)/leaderboard-utils";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const {
    sorted,
    yourRank,
    you,
    rival,
    leader,
    rivalDistance,
    leaderDistance,
    youProgress,
    rivalProgress,
  } = buildLeaderboardState(competitors);

  return (
    <ThemedView style={styles.screen}>
      <View
        pointerEvents="none"
        style={[
          styles.backgroundBlob,
          { backgroundColor: colorScheme === "dark" ? "#123640" : "#D8F3FF" },
        ]}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText style={[styles.kicker, { color: palette.icon }]}>
            LIVE CHALLENGE
          </ThemedText>
          <ThemedText
            type="title"
            style={[styles.title, { fontFamily: Fonts.rounded }]}
          >
            Leaderboard
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Compete in real time with your crew.
          </ThemedText>
        </ThemedView>

        <ThemedView
          lightColor="#0F172A"
          darkColor="#1B2735"
          style={styles.heroCard}
        >
          <ThemedText style={styles.heroLabel}>
            TODAY&apos;S PACESETTER
          </ThemedText>
          <ThemedText style={[styles.heroName, { fontFamily: Fonts.rounded }]}>
            {leader.name}
          </ThemedText>
          <ThemedText style={styles.heroSteps}>
            {formatSteps(leader.steps)} steps
          </ThemedText>

          <View style={styles.heroFooter}>
            <View>
              <ThemedText style={styles.heroMetaLabel}>Your rank</ThemedText>
              <ThemedText style={styles.heroMetaValue}>#{yourRank}</ThemedText>
            </View>
            <View>
              <ThemedText style={styles.heroMetaLabel}>Gap to #1</ThemedText>
              <ThemedText style={styles.heroMetaValue}>
                {formatSteps(leaderDistance)}
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { borderColor: colorScheme === "dark" ? "#2F3A45" : "#DDE7EE" },
          ]}
        >
          <ThemedText
            style={[styles.sectionTitle, { fontFamily: Fonts.rounded }]}
          >
            Live Race
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            You are {formatSteps(rivalDistance)} steps behind {rival.name}.
          </ThemedText>

          <View style={styles.raceRow}>
            <ThemedText style={styles.raceName}>You</ThemedText>
            <ThemedText style={styles.raceSteps}>
              {formatSteps(you.steps)}
            </ThemedText>
          </View>
          <View
            style={[
              styles.track,
              {
                backgroundColor: colorScheme === "dark" ? "#24313F" : "#EAF1F6",
              },
            ]}
          >
            <View style={[styles.youFill, { width: `${youProgress}%` }]} />
          </View>

          <View style={styles.raceRow}>
            <ThemedText style={styles.raceName}>{rival.name}</ThemedText>
            <ThemedText style={styles.raceSteps}>
              {formatSteps(rival.steps)}
            </ThemedText>
          </View>
          <View
            style={[
              styles.track,
              {
                backgroundColor: colorScheme === "dark" ? "#24313F" : "#EAF1F6",
              },
            ]}
          >
            <View style={[styles.rivalFill, { width: `${rivalProgress}%` }]} />
          </View>
        </ThemedView>

        <ThemedView
          style={[
            styles.card,
            { borderColor: colorScheme === "dark" ? "#2F3A45" : "#DDE7EE" },
          ]}
        >
          <ThemedText
            style={[styles.sectionTitle, { fontFamily: Fonts.rounded }]}
          >
            Friends Ranking
          </ThemedText>

          {sorted.map((person, index) => {
            const rank = index + 1;
            const rankColor =
              rank === 1
                ? "#F59E0B"
                : rank === 2
                  ? "#8B9DB0"
                  : rank === 3
                    ? "#A16207"
                    : palette.icon;

            return (
              <View
                key={person.id}
                testID={`rank-row-${rank}`}
                style={styles.rankRow}
              >
                <ThemedText style={[styles.rankIndex, { color: rankColor }]}>
                  #{rank}
                </ThemedText>

                <View style={styles.rankMain}>
                  <ThemedText
                    testID={`rank-name-${rank}`}
                    style={styles.rankName}
                  >
                    {person.name}
                  </ThemedText>
                  <ThemedText style={styles.rankMeta}>
                    {person.streak} day streak
                  </ThemedText>
                </View>

                <View style={styles.rankRight}>
                  <ThemedText style={styles.rankSteps}>
                    {formatSteps(person.steps)}
                  </ThemedText>
                  <View
                    style={[
                      styles.statusDot,
                      {
                        backgroundColor: person.isOnline
                          ? "#22C55E"
                          : "#94A3B8",
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backgroundBlob: {
    position: "absolute",
    top: -140,
    right: -110,
    width: 320,
    height: 320,
    borderRadius: 320,
  },
  content: {
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 70,
    paddingBottom: 34,
  },
  header: {
    gap: 6,
    backgroundColor: "transparent",
  },
  kicker: {
    letterSpacing: 1.1,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    lineHeight: 42,
  },
  subtitle: {
    opacity: 0.85,
  },
  heroCard: {
    borderRadius: 24,
    padding: 20,
    gap: 6,
  },
  heroLabel: {
    color: "#A5B4FC",
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "700",
  },
  heroName: {
    color: "#F8FAFC",
    fontSize: 30,
    lineHeight: 34,
  },
  heroSteps: {
    color: "#E2E8F0",
    fontSize: 17,
  },
  heroFooter: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  heroMetaLabel: {
    color: "#A5B4FC",
    fontSize: 12,
  },
  heroMetaValue: {
    color: "#F8FAFC",
    fontWeight: "700",
    fontSize: 19,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 27,
  },
  sectionSubtitle: {
    opacity: 0.8,
    marginBottom: 2,
  },
  raceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  raceName: {
    fontSize: 15,
    fontWeight: "600",
  },
  raceSteps: {
    fontSize: 15,
    fontWeight: "700",
  },
  track: {
    borderRadius: 999,
    height: 10,
    overflow: "hidden",
    marginBottom: 8,
  },
  youFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  rivalFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#F97316",
  },
  rankRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#94A3B833",
  },
  rankIndex: {
    width: 42,
    fontWeight: "800",
    fontSize: 16,
  },
  rankMain: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: "700",
  },
  rankMeta: {
    fontSize: 13,
    opacity: 0.75,
  },
  rankRight: {
    alignItems: "flex-end",
    gap: 5,
    minWidth: 84,
  },
  rankSteps: {
    fontWeight: "700",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});
