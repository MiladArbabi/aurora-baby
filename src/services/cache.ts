// src/services/cache.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'aurora_';

/**
 * Save any serializable value under a given key.
 */
export async function setCache<T>(key: string, data: T): Promise<void> {
  const json = JSON.stringify(data);
  await AsyncStorage.setItem(CACHE_PREFIX + key, json);
}

/**
 * Retrieve a value by key, or null if not found.
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const json = await AsyncStorage.getItem(CACHE_PREFIX + key);
  return json ? (JSON.parse(json) as T) : null;
}

/**
 * Remove a value by key.
 */
export async function removeCache(key: string): Promise<void> {
  await AsyncStorage.removeItem(CACHE_PREFIX + key);
}
