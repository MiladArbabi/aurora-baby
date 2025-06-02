// src/services/PrivacySettingsStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PrivacySettings {
  shareAnalytics: boolean;
  shareWithPediatrician: boolean;
  allowNotifications: boolean;
}

const KEY = '@privacy_settings';

// Return defaults if none saved yet
export const getPrivacySettings = async (): Promise<PrivacySettings> => {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return {
      shareAnalytics: true,
      shareWithPediatrician: false,
      allowNotifications: true,
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    // If parse fails, return defaults
    return {
      shareAnalytics: true,
      shareWithPediatrician: false,
      allowNotifications: true,
    };
  }
};

export const savePrivacySettings = async (settings: PrivacySettings): Promise<void> => {
  await AsyncStorage.setItem(KEY, JSON.stringify(settings));
};
