// src/services/googleAuth.ts
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';

const clientId = Constants.expoConfig?.extra?.googleWebClientId!;

export async function signInWithGoogleAsync() {
  const redirectUri = makeRedirectUri({ scheme: 'com.your.app' });
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth` +
    `?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent('profile email')}`;

  // This opens the system browser and waits for the redirect back to your app
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type === 'success' && result.url) {
    // extract the `access_token` out of result.url
    const [, queryString] = result.url.split('#');
    const params = Object.fromEntries(
      queryString.split('&').map(kv => kv.split('=').map(decodeURIComponent) as [string,string])
    );
    return params;  
  }

  throw new Error('Google sign in cancelled or failed');
}
