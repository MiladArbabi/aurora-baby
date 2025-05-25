// src/services/RemoteConfigService.ts
import remoteConfig from '@react-native-firebase/remote-config';

let _rc: any = null;
try {
  // if the native module is installed & linked this will succeed
  _rc = require('@react-native-firebase/remote-config').default();
} catch {
  console.warn('[RemoteConfig] native module not available, falling back to defaults');
}

/** Initialize remote config defaults / fetch only if module is present. */
export async function initRemoteConfig() {
  if (!_rc) return;
  await _rc.setDefaults({
    personalization_enabled: false,
    advanced_tone_selector: false,
    // …other flags
  });
  await _rc.fetchAndActivate();
}

/** Safe feature-flag getter. */
export function isFeatureEnabled(key: string): boolean {
  if (!_rc) return false;
  return _rc.getValue(key).asBoolean();
}