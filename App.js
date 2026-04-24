import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UnitProvider } from './contexts/UnitContext';
import { PrivacyProvider } from './contexts/PrivacyContext';

import UnitSelector from './components/UnitSelector';
import PrivacySettingsScreen from './screens/PrivacySettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PrivacyProvider>
      <UnitProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={UnitSelector} />
            <Stack.Screen name="Privacy" component={PrivacySettingsScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </UnitProvider>
    </PrivacyProvider>
  );
}