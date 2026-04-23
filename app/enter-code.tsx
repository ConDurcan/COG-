import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthService } from "@/services/auth-service";

export default function EnterCodeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizeCode = (input: string) => input.trim().toUpperCase();

  const isValidFormat = (input: string) => {
    const normalized = normalizeCode(input);
    return normalized.length === 8 && /^[A-Z0-9]+$/.test(normalized);
  };

  const handleSubmit = async () => {
    const normalizedCode = normalizeCode(code);

    if (!isValidFormat(code)) {
      setError("Code must be 8 characters (letters and numbers)");
      return;
    }

    try {
      setError(null);
      setIsLoading(true);

      // Validate code exists by fetching the data
      await AuthService.getPublicProgressByCode(normalizedCode);

      // If successful, navigate to shared progress view
      router.push(`/share/${normalizedCode}`);
    } catch (fetchError) {
      const errorMessage =
        fetchError instanceof Error
          ? fetchError.message
          : "This code doesn't exist or has been revoked.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text.toUpperCase());
    setError(null);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Enter Code</ThemedText>
      <ThemedText style={styles.subtitle}>
        Ask a friend to share their progress code
      </ThemedText>

      <View style={styles.inputSection}>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: error ? "#ff6b6b" : palette.tint,
              color: palette.text,
            },
          ]}
          placeholder="E.g. ABC12345"
          placeholderTextColor={palette.text + "80"}
          value={code}
          onChangeText={handleCodeChange}
          editable={!isLoading}
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      </View>

      <Pressable
        style={[styles.submitButton, { borderColor: palette.tint }]}
        onPress={handleSubmit}
        disabled={isLoading || code.length === 0}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={palette.tint} />
        ) : (
          <ThemedText style={[styles.submitButtonText, { color: palette.tint }]}>
            View Progress
          </ThemedText>
        )}
      </Pressable>

      <ThemedText style={styles.helperText}>
        Enter an 8-character code to view someone's progress.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  inputSection: {
    gap: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: "monospace",
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 12,
    color: "#ff6b6b",
  },
  submitButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
  },
});
