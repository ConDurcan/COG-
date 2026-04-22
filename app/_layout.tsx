import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { AuthProvider } from "@/context/auth-context";
import { StepGoalProvider, useStepGoal } from "@/context/step-goal-context";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <StepGoalProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <AppNavigator />
          <StatusBar style="auto" />
        </ThemeProvider>
      </StepGoalProvider>
    </AuthProvider>
  );
}

function AppNavigator() {
  const { isHydrating, isLoggedIn } = useAuth();
  const { isHydrating: isStepGoalHydrating } = useStepGoal();

  if (isHydrating || isStepGoalHydrating) {
    return null;
  }

  return (
    <Stack>
      <Stack.Protected guard={!isLoggedIn}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen
        name="share/[code]"
        options={{ title: "Shared Progress" }}
      />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
      />
    </Stack>
  );
}
