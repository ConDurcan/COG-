import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useUnit, UNITS } from '../contexts/UnitContext';

export default function UnitSelector() {
  const { unit, changeUnit } = useUnit();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Distance Unit</Text>
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.button,
            unit === UNITS.KILOMETERS && styles.buttonActive,
          ]}
          onPress={() => changeUnit(UNITS.KILOMETERS)}
        >
          <Text
            style={[
              styles.buttonText,
              unit === UNITS.KILOMETERS && styles.buttonTextActive,
            ]}
          >
            Kilometers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            unit === UNITS.MILES && styles.buttonActive,
          ]}
          onPress={() => changeUnit(UNITS.MILES)}
        >
          <Text
            style={[
              styles.buttonText,
              unit === UNITS.MILES && styles.buttonTextActive,
            ]}
          >
            Miles
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  buttonTextActive: {
    color: '#fff',
  },
});
