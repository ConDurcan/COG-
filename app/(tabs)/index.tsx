import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthService } from "@/services/auth-service";

export default function HomeScreen() {
  const { user, setUser, isLoggedIn } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Log in to start tracking your activity.");
  const [redirectToActivity, setRedirectToActivity] = useState(false);

  useEffect(() => {
    const restore = async () => {
      const restored = await AuthService.restoreUser();
      if (!restored) {
        return;
      }

      setUser(restored);
      setStatus(`Welcome back ${restored.displayName}`);
      setRedirectToActivity(true);
    };

    void restore();
  }, [setUser]);

  const routeToActivity = () => {
    setRedirectToActivity(true);
  };

  const handleSignup = async () => {
    try {
      const created = await AuthService.signup({
        email,
        displayName: displayName || "Compfit User",
        password,
      });

      setUser(created);
      setStatus(`Signed up ${created.email}`);
      setPassword("");
      routeToActivity();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Signup failed");
    }
  };

  const handleLogin = async () => {
    try {
      const loggedIn = await AuthService.login({ email, password });
      setUser(loggedIn);
      setStatus(`Logged in ${loggedIn.email}`);
      setPassword("");
      routeToActivity();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setStatus("Logged out");
      setRedirectToActivity(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Logout failed");
    }
  };

  if (redirectToActivity && isLoggedIn) {
    return <Redirect href="/explore" />;
  }

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
        <ThemedText type="title">Compfit Login</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Current Session</ThemedText>
        <ThemedText>
          {isLoggedIn ? `Logged in as: ${user?.email}` : "No user logged in"}
        </ThemedText>
        <ThemedText>{status}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Sign Up Or Log In</ThemedText>
        <TextInput
          placeholder="Email"
          placeholderTextColor={palette.icon}
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          style={[
            styles.input,
            {
              borderColor: palette.icon,
              backgroundColor: palette.background,
              color: palette.text,
            },
          ]}
        />
        <TextInput
          placeholder="Display name (for sign up)"
          placeholderTextColor={palette.icon}
          value={displayName}
          onChangeText={setDisplayName}
          style={[
            styles.input,
            {
              borderColor: palette.icon,
              backgroundColor: palette.background,
              color: palette.text,
            },
          ]}
        />
        <TextInput
          placeholder="Password"
          placeholderTextColor={palette.icon}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[
            styles.input,
            {
              borderColor: palette.icon,
              backgroundColor: palette.background,
              color: palette.text,
            },
          ]}
        />

        <ThemedView style={styles.buttonRow}>
          <Pressable
            onPress={handleSignup}
            style={[styles.button, { borderColor: palette.icon }]}
          >
            <ThemedText type="defaultSemiBold">Sign Up</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleLogin}
            style={[styles.button, { borderColor: palette.icon }]}
          >
            <ThemedText type="defaultSemiBold">Log In</ThemedText>
          </Pressable>
        </ThemedView>

        <ThemedView style={styles.buttonRow}>
          {isLoggedIn ? (
            <Pressable
              onPress={routeToActivity}
              style={[styles.button, { borderColor: palette.icon }]}
            >
              <ThemedText type="defaultSemiBold">Go To Activity</ThemedText>
            </Pressable>
          ) : null}
          <Pressable
            onPress={handleLogout}
            style={[styles.button, { borderColor: palette.icon }]}
          >
            <ThemedText type="defaultSemiBold">Log Out</ThemedText>
          </Pressable>
        </ThemedView>
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});