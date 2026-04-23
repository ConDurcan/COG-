import React from 'react';
import { View, Text, Switch,StyleSheet,ScrollView,} from 'react-native';
import { usePrivacy } from '../contexts/PrivacyContext';

export default function PrivacySettingsScreen() {
  const { privacySettings, updatePrivacySetting } = usePrivacy();

  const settings = [
    {
      key: 'showSteps',
      label: 'Show Step Count',
      description: 'Allow league members to see your daily steps',
    },
    {
      key: 'showDistance',
      label: 'Show Distance',
      description: 'Allow league members to see your distance travelled',
    },
    {
      key: 'showProfile',
      label: 'Show Profile',
      description: 'Allow others to find and view your profile',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Preferences</Text>
      <Text style={styles.subtitle}>
        Control what information others can see about you
      </Text>

      {settings.map((setting) => (
        <View key={setting.key} style={styles.row}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{setting.label}</Text>
            <Text style={styles.description}>{setting.description}</Text>
          </View>
          <Switch
            value={privacySettings[setting.key]}
            onValueChange={(value) =>
              updatePrivacySetting(setting.key, value)
            }
            trackColor={{ false: '#ccc', true: '#007AFF' }}
            thumbColor="#fff"
          />
        </View>
      ))}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          🔒 Your data is always kept secure. These settings only control
          what other users can see in leagues and comparisons.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textContainer: { flex: 1, marginRight: 12 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  description: { fontSize: 13, color: '#666' },
  infoBox: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f7ff',
    borderRadius: 12,
  },
  infoText: { fontSize: 13, color: '#007AFF', lineHeight: 20 },
});
