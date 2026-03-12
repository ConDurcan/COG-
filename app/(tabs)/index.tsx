import { Pedometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const [steps, setSteps] = useState(0);
  // Non-empty status means we render a message instead of the step count.
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const getSteps = async () => {
      // Ask for motion/fitness permission before reading pedometer data.
      const { granted } = await Pedometer.requestPermissionsAsync();
      
      if (!granted) {
        setStatus('Permission denied');
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0); // midnight = start of today

      const result = await Pedometer.getStepCountAsync(start, end);
      setSteps(result.steps);
      // Clear status so the numeric step value is shown.
      setStatus('');
    };

    getSteps();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>TODAY'S STEPS</Text>
      {status ? (
        <Text style={styles.status}>{status}</Text>
      ) : (
        <Text style={styles.steps}>{steps.toLocaleString()}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    gap: 8,
  },
  label: {
    color: '#888888',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  steps: {
    color: '#04ff36',
    fontSize: 80,
    fontWeight: 'bold',
    letterSpacing: -2,
  },
  status: {
    color: '#666666',
    fontSize: 16,
    fontStyle: 'italic',
  },
});