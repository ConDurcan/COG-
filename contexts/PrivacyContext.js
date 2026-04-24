import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrivacyContext = createContext();

export const PRIVACY_OPTIONS = {
  SHOW_STEPS: 'showSteps',
  SHOW_DISTANCE: 'showDistance',
  SHOW_PROFILE: 'showProfile',
};

export function PrivacyProvider({ children }) {
  const [privacySettings, setPrivacySettings] = useState({
    showSteps: true,
    showDistance: true,
    showProfile: true,
  });

  // Load saved preferences on app start
  useEffect(() => {
    const loadPrivacySettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('privacySettings');
        if (saved) {
          setPrivacySettings(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load privacy settings:', error);
      }
    };
    loadPrivacySettings();
  }, []);

  // Save whenever settings change
  const updatePrivacySetting = async (key, value) => {
    try {
      const updated = { ...privacySettings, [key]: value };
      await AsyncStorage.setItem('privacySettings', JSON.stringify(updated));
      setPrivacySettings(updated);
    } catch (error) {
      console.error('Failed to save privacy setting:', error);
    }
  };

  return (
    <PrivacyContext.Provider value={{ privacySettings, updatePrivacySetting }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export const usePrivacy = () => {
  const context = useContext(PrivacyContext);
  if (!context) {
    throw new Error('usePrivacy must be used within a PrivacyProvider');
  }
  return context;
};
