// src/services/GapSettingsStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultGapSettingsForAge } from './GapSettingsDefaults';
import { BabyProfile } from 'models/BabyProfile';

// ---------------
// 1) Define an interface for gap thresholds
// ---------------
//   - feedingGapMinutes: maximum minutes between feedings before flag
//   - diaperGapHours: maximum hours between diaper changes
//   - sleepGapHours: maximum hours between sleep sessions (optional)
//   - ...you can add more if needed (e.g. “medicineGapHours”)
export interface GapSettings {
  feedingGapMinutes: number;
  diaperGapHours: number;
  sleepGapHours: number;
}

// ---------------
// 2) Key under which we store these per-child (we’ll store by child ID)
// ---------------
const BASE_KEY = '@gap_settings';

// Helper to build a child-scoped key
const makeKeyForChild = (childId: string) => `${BASE_KEY}:${childId}`;

// ---------------
// 3) Fetch existing settings (or return defaults if none)
// ---------------
export const getGapSettings = async (
  childId: string
   ): Promise<GapSettings> => {
      // 1) Try to load a custom override
      const raw = await AsyncStorage.getItem(makeKeyForChild(childId));
      if (raw) {
        try {
          return JSON.parse(raw) as GapSettings;
        } catch {
          await AsyncStorage.removeItem(makeKeyForChild(childId));
          // Fall through to “compute default”
        }
      }
      // 2) No custom value or parse failed → compute default from child’s DOB
      //    We need the child's profile to get dob:
      //    (Assume we have a synchronous cache or call BabyProfileStorage)
      //    For simplicity, let’s fetch it here:
      const fromStorage = await AsyncStorage.getItem('@child_profile:' + childId);
      if (fromStorage) {
        try {
          const child: BabyProfile = JSON.parse(fromStorage);
          return defaultGapSettingsForAge(child.birthDate);
        } catch {
          // if parse fails, fall back to a fallback default:
        }
      }
      // 3) If something is missing, fallback to a reasonable constant
      return {
        feedingGapMinutes: 180,
        diaperGapHours: 6,
        sleepGapHours: 6,
      };
     };

// ---------------
// 4) Save new settings
// ---------------
export const saveGapSettings = async (
  childId: string,
  settings: GapSettings
): Promise<void> => {
  await AsyncStorage.setItem(
    makeKeyForChild(childId),
    JSON.stringify(settings)
  );
};

// ---------------
// 5) Remove custom settings (fallback to defaults)
// ---------------
export const resetGapSettings = async (childId: string): Promise<void> => {
  await AsyncStorage.removeItem(makeKeyForChild(childId));
};
