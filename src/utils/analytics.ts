// src/utils/analytics.ts
import analytics from '@react-native-firebase/analytics';

let _analytics: any = null;
try {
  // if native-firebase/analytics is installed & linked this will succeed
  _analytics = require('@react-native-firebase/analytics').default();
} catch (err) {
  console.warn('[Analytics] native module not available, events will be no-op');
}

/**
 * Log an analytics event if possible, otherwise silently ignore.
 * @param name snake_case event name
 * @param params optional key/value map
 */
export function logEvent(
  name: string,
  params?: Record<string, any>
): Promise<void> {
  if (!_analytics) return Promise.resolve();
  return _analytics.logEvent(name, params);
}
