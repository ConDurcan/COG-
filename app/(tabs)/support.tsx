import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SupportService } from "@/services/support-service";

const ISSUE_TYPES = ["bug", "error", "other"] as const;

type IssueType = (typeof ISSUE_TYPES)[number];

export default function SupportScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const [issueType, setIssueType] = useState<IssueType>("bug");
  const [description, setDescription] = useState("");
  const [statusMessage, setStatusMessage] = useState(
    "Select an issue type and describe the problem to submit a ticket.",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = user?.email ?? "";
  const canSubmit =
    email.length > 0 && description.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!email) {
      setStatusMessage("You must be signed in to submit a support ticket.");
      return;
    }

    if (!description.trim()) {
      setStatusMessage("Please describe the issue before submitting.");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Submitting ticket...");

    try {
      await SupportService.createSupportTicket({
        userEmail: email,
        issueType,
        issueDescription: description,
      });
      setDescription("");
      setStatusMessage(
        "Support ticket submitted successfully. We’ll follow up via email.",
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit support ticket.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: palette.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerRow}>
        <IconSymbol name="questionmark.circle" size={64} color={palette.tint} />
        <View style={styles.headerText}>
          <ThemedText type="title">Support</ThemedText>
          <ThemedText type="subtitle">
            Send us a ticket and we’ll follow up by email.
          </ThemedText>
        </View>
      </View>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Your Account</ThemedText>
        <Text style={[styles.accountEmail, { color: palette.text }]}>
          {" "}
          {email || "No email available"}
        </Text>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Issue Type</ThemedText>
        <View style={styles.issueTypeRow}>
          {ISSUE_TYPES.map((type) => {
            const selected = type === issueType;
            return (
              <Pressable
                key={type}
                onPress={() => setIssueType(type)}
                style={[
                  styles.issueTypeButton,
                  {
                    borderColor: selected ? palette.tint : palette.icon,
                    backgroundColor: selected ? palette.tint : "transparent",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.issueTypeText,
                    { color: selected ? palette.background : palette.text },
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Issue Description</ThemedText>
        <TextInput
          accessibilityLabel="Support issue description"
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the issue in detail..."
          placeholderTextColor={palette.icon}
          style={[
            styles.descriptionInput,
            { color: palette.text, borderColor: palette.icon },
          ]}
          textAlignVertical="top"
        />
      </ThemedView>

      <Pressable
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: canSubmit ? palette.tint : palette.icon,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <ThemedText type="defaultSemiBold">
          {isSubmitting ? "Sending..." : "Submit Ticket"}
        </ThemedText>
      </Pressable>

      <ThemedView style={styles.section}>
        <ThemedText type="defaultSemiBold">Status</ThemedText>
        <Text style={[styles.statusMessage, { color: palette.text }]}>
          {statusMessage}
        </Text>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 56,
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  accountEmail: {
    fontSize: 16,
    lineHeight: 24,
  },
  issueTypeRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  issueTypeButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  issueTypeText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  descriptionInput: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    paddingVertical: 14,
  },
  statusMessage: {
    fontSize: 15,
    lineHeight: 22,
  },
});
