import AsyncStorage from '@react-native-async-storage/async-storage';

const NIGHT_MODE_KEY = '@night_mode';
const NIGHT_START_KEY = '@night_start';
const NIGHT_END_KEY = '@night_end';

interface NightModeConfig {
  mode: 'auto' | 'day' | 'night';
  nightStart: number; // Required, with default
  nightEnd: number;   // Required, with default
}

export async function setNightModeConfig(config: NightModeConfig): Promise<void> {
  await AsyncStorage.multiSet([
    [NIGHT_MODE_KEY, config.mode],
    [NIGHT_START_KEY, config.nightStart.toString()],
    [NIGHT_END_KEY, config.nightEnd.toString()],
  ]);
}

export async function getNightModeConfig(): Promise<NightModeConfig> {
  const [[, mode], [, nightStart], [, nightEnd]] = await AsyncStorage.multiGet([
    NIGHT_MODE_KEY,
    NIGHT_START_KEY,
    NIGHT_END_KEY,
  ]);
  return {
    mode: (mode || 'auto') as 'auto' | 'day' | 'night',
    nightStart: nightStart ? parseInt(nightStart) : 18,
    nightEnd: nightEnd ? parseInt(nightEnd) : 6,
  };
}

export async function isNightMode(): Promise<boolean> {
  const config = await getNightModeConfig();
  if (config.mode === 'night') return true;
  if (config.mode === 'day') return false;

  const hour = new Date().getHours();
  const { nightStart, nightEnd } = config;
  if (nightEnd < nightStart) {
    return hour >= nightStart || hour < nightEnd;
  }
  return hour >= nightStart && hour < nightEnd;
}