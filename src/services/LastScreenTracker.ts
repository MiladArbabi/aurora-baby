import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SCREEN_KEY = 'lastScreen';

export const saveLastScreen = async (screenName: string) => {
  await AsyncStorage.setItem(LAST_SCREEN_KEY, screenName);
};

export const getLastScreen = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(LAST_SCREEN_KEY);
};
