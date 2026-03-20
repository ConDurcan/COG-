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
  const [status, setStatus] = useState("Ready");
  const [storedAccountsJson, setStoredAccountsJson] = useState("[]");

  useEffect(() => {
    const restore = async () => {
      const restored = await AuthService.restoreUser();
      if (restored) {
        setUser(restored);
        setStatus(`Restored session for ${restored.email}`);
      }
    };

    void restore();
  }, [setUser]);

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
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Login failed");
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    setStatus("Logged out");
  };

  const handleViewStoredAccounts = async () => {
    const accounts = await AuthService.getStoredAccounts();
    setStoredAccountsJson(JSON.stringify(accounts, null, 2));
    setStatus(`Loaded ${accounts.length} stored account(s)`);
  };

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
        <ThemedText type="title">Auth Playground</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Current Session</ThemedText>
        <ThemedText>
          {isLoggedIn ? `Logged in as: ${user?.email}` : "No user logged in"}
        </ThemedText>
        <ThemedText>Status: {status}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Sign Up / Login</ThemedText>
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
          placeholder="Display name (for signup)"
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
          placeholder="Password (demo only)"
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
          <Pressable
            onPress={handleLogout}
            style={[styles.button, { borderColor: palette.icon }]}
          >
            <ThemedText type="defaultSemiBold">Log Out</ThemedText>
          </Pressable>
          <Pressable
            onPress={handleViewStoredAccounts}
            style={[styles.button, { borderColor: palette.icon }]}
          >
            <ThemedText type="defaultSemiBold">View Current Account</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Current Account JSON</ThemedText>
        <ThemedText style={styles.json}>{storedAccountsJson}</ThemedText>
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
  stepContainer: {
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
  json: {
    fontSize: 12,
  },
});
