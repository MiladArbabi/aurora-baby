// src/services/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'aurora_';
const TTL_KEY_SUFFIX = '_ttl';

export async function setCache<T>(key: string, data: T, ttlSeconds?: number): Promise<void> {
  try {
    if (!key) throw new Error('Key must be non-empty');
    const json = JSON.stringify(data);
    await AsyncStorage.setItem(CACHE_PREFIX + key, json);
    if (ttlSeconds) {
      const expiry = Date.now() + ttlSeconds * 1000;
      await AsyncStorage.setItem(CACHE_PREFIX + key + TTL_KEY_SUFFIX, expiry.toString());
    }
  } catch (err) {
    console.error('[Cache] setCache error:', err);
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (!key) throw new Error('Key must be non-empty');
    const ttl = await AsyncStorage.getItem(CACHE_PREFIX + key + TTL_KEY_SUFFIX);
    if (ttl && Date.now() > parseInt(ttl)) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      await AsyncStorage.removeItem(CACHE_PREFIX + key + TTL_KEY_SUFFIX);
      return null;
    }
    const json = await AsyncStorage.getItem(CACHE_PREFIX + key);
    return json ? (JSON.parse(json) as T) : null;
  } catch (err) {
    console.error('[Cache] getCache error:', err);
    return null;
  }
}

export async function removeCache(key: string): Promise<void> {
  try {
    if (!key) throw new Error('Key must be non-empty');
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
    await AsyncStorage.removeItem(CACHE_PREFIX + key + TTL_KEY_SUFFIX);
  } catch (err) {
    console.error('[Cache] removeCache error:', err);
  }
}
