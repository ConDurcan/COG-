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
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000000' },
  label: { color: '#4e5653', fontSize: 14, letterSpacing: 3, marginBottom: 12 },
  steps: { color: '#08b464', fontSize: 80, fontWeight: 'bold' },
  status: { color: '#ffffff', fontSize: 18 },
});