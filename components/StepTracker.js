import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUnit } from '../contexts/UnitContext';

export default function StepTracker({ steps, distanceInKm }) {
  const { formatDistance } = useUnit();

  return (
    <View style={styles.container}>
      <Text style={styles.steps}>{steps.toLocaleString()}</Text>
      <Text style={styles.stepsLabel}>steps</Text>
      
      <Text style={styles.distance}>{formatDistance(distanceInKm)}</Text>
      <Text style={styles.distanceLabel}>distance walked</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  steps: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
  },
  stepsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  distance: {
    fontSize: 32,
    fontWeight: '600',
    color: '#007AFF',
  },
  distanceLabel: {
    fontSize: 14,
    color: '#666',
  },
});
