import React from 'react';
import { UnitProvider } from './contexts/UnitContext';
import { View } from 'react-native';
import UnitSelector from './components/UnitSelector';

export default function App() {
  return (
    <UnitProvider>
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <UnitSelector />
      </View>
    </UnitProvider>
  );
}
