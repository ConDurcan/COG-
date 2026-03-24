import { Pedometer } from "expo-sensors";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function ActivityScreen() {
  const [steps, setSteps] = useState(0);
  const [stepGoalInput, setStepGoalInput] = useState("10000");
  const [status, setStatus] = useState("Loading...");

  const parsedStepGoal = Number.parseInt(stepGoalInput, 10);
  const stepGoal =
    Number.isFinite(parsedStepGoal) && parsedStepGoal >= 0 ? parsedStepGoal : 0;
  const stepsLeft = Math.max(stepGoal - steps, 0);

  useEffect(() => {
    const getSteps = async () => {
      const { granted } = await Pedometer.requestPermissionsAsync();

      if (!granted) {
        setStatus("Permission denied");
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      setSteps(result.steps);
      setStatus("");
    };

    void getSteps();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TODAY'S STEPS</Text>
      {status ? (
        <Text style={styles.status}>{status}</Text>
      ) : (
        <Text style={styles.steps}>{steps.toLocaleString()}</Text>
      )}

      <View style={styles.goalSection}>
        <Text style={styles.goalLabel}>STEP GOAL</Text>
        <TextInput
          accessibilityLabel="Step goal"
          keyboardType="number-pad"
          value={stepGoalInput}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, "");
            setStepGoalInput(numericText);
          }}
          placeholder="Enter step goal"
          placeholderTextColor="#5a5a5a"
          style={styles.goalInput}
        />
        <Text style={styles.stepsLeftLabel}>STEPS LEFT</Text>
        <Text style={styles.stepsLeftValue}>{stepsLeft.toLocaleString()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    gap: 8,
  },
  label: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  steps: {
    color: "#04ff36",
    fontSize: 80,
    fontWeight: "bold",
    letterSpacing: -2,
  },
  status: {
    color: "#666666",
    fontSize: 16,
    fontStyle: "italic",
  },
  goalSection: {
    marginTop: 24,
    alignItems: "center",
    width: "80%",
    maxWidth: 320,
    gap: 8,
  },
  goalLabel: {
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  goalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 10,
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stepsLeftLabel: {
    marginTop: 8,
    color: "#888888",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  stepsLeftValue: {
    color: "#ff9a04",
    fontSize: 42,
    fontWeight: "bold",
    letterSpacing: -1,
  },
});
