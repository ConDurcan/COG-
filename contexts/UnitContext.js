import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UnitContext = createContext();

export const UNITS = {
  KILOMETERS: 'km',
  MILES: 'mi',
};

// Conversion factor: 1 km = 0.621371 miles
const KM_TO_MILES = 0.621371;

export function UnitProvider({ children }) {
  const [unit, setUnit] = useState(UNITS.KILOMETERS);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference on app start
  useEffect(() => {
    const loadUnit = async () => {
      try {
        const savedUnit = await AsyncStorage.getItem('distanceUnit');
        if (savedUnit) {
          setUnit(savedUnit);
        }
      } catch (error) {
        console.error('Failed to load unit preference:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUnit();
  }, []);

  // Save preference whenever it changes
  const changeUnit = async (newUnit) => {
    try {
      await AsyncStorage.setItem('distanceUnit', newUnit);
      setUnit(newUnit);
    } catch (error) {
      console.error('Failed to save unit preference:', error);
    }
  };

  // Utility function to convert and format distance
  const formatDistance = (distanceInKm) => {
    if (unit === UNITS.MILES) {
      return `${(distanceInKm * KM_TO_MILES).toFixed(2)} mi`;
    }
    return `${distanceInKm.toFixed(2)} km`;
  };

  // Get raw converted value (useful for calculations)
  const convertDistance = (distanceInKm) => {
    if (unit === UNITS.MILES) {
      return distanceInKm * KM_TO_MILES;
    }
    return distanceInKm;
  };

  return (
    <UnitContext.Provider
      value={{
        unit,
        changeUnit,
        formatDistance,
        convertDistance,
        isLoading,
      }}
    >
      {children}
    </UnitContext.Provider>
  );
}

export const useUnit = () => {
  const context = useContext(UnitContext);
  if (!context) {
    throw new Error('useUnit must be used within a UnitProvider');
  }
  return context;
};
