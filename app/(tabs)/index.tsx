import { StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Link } from "expo-router";

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <IconSymbol
          name="person.crop.circle"
          size={220}
          color={palette.icon}
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Compfit Home</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Current Session</ThemedText>
        <ThemedText>{`Logged in as: ${user?.email ?? "Unknown user"}`}</ThemedText>
        <ThemedText>
          Use the Activity tab to view today's step count and manage your step
          goal.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/League">
          <ThemedText type="subtitle">Create a League</ThemedText>
        </Link>
        <ThemedText>Tap here to go to the League Creator page.</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -25,
    left: 10,
    position: "absolute",
  },
  titleContainer: {
    gap: 8,
  },
  section: {
    gap: 8,
    marginBottom: 8,
  },
  stepContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
});
