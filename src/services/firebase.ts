// src/services/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  Auth, 
  AuthCredential, 
  User,
  UserCredential,
  signInWithCredential 
} from 'firebase/auth';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { signInWithGoogleAsync } from './googleAuth';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || 'AIzaSyC5xeeWjT3XpPMPamhSc748D9Bbif0RhzM',
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || 'aurora-baby-mobile.firebaseapp.com',
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || 'aurora-baby-mobile',
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || 'aurora-baby-mobile.appspot.com',
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || '450824864919',
  appId: Constants.expoConfig?.extra?.firebaseAppId || '1:450824864919:web:39dc697565b309cb4ed5d2',
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId || 'G-DF2KM62PL6'
};

console.log('Expo Config:', JSON.stringify(Constants.expoConfig));
console.log('Firebase Config:', JSON.stringify(firebaseConfig));

if (!firebaseConfig.apiKey) {
  throw new Error('Firebase API key is missing from app.config.js');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const { access_token } = await signInWithGoogleAsync();
  const credential = GoogleAuthProvider.credential(null, access_token);
  return await signInWithCredential(auth, credential);
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userPassword', password); // Store credentials separately
    console.log('Email Sign-In Token:', token);
    console.log('Stored credentials:', { email, password });
    return result.user;
  } catch (error) {
    console.error('Email Sign-In Error:', error);
    throw error;
  }
};

export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userEmail', email);
    await AsyncStorage.setItem('userPassword', password); // Store credentials separately
    console.log('Email Sign-Up Token:', token);
    console.log('Stored credentials:', { email, password });
    return result.user;
  } catch (error) {
    console.error('Email Sign-Up Error:', error);
    throw error;
  }
};

export const checkAuthState = async (): Promise<User | null> => {
  const tokenEntry = await AsyncStorage.getItem('userToken');
  const emailEntry = await AsyncStorage.getItem('userEmail');
  const passwordEntry = await AsyncStorage.getItem('userPassword');
  const token = tokenEntry || null;
  const email = emailEntry || null;
  const password = passwordEntry || null;

  console.log('Checking auth state, token from storage:', token);
  console.log('Stored email:', email);
  console.log('Stored password:', password ? '****' : 'null');
  if (!token) return null;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged user:', user ? user.email : 'null');
      if (user) {
        try {
          const newToken = await user.getIdToken(true);
          await AsyncStorage.setItem('userToken', newToken);
          console.log('Updated token:', newToken);
          resolve(user);
        } catch (error) {
          console.error('Token refresh error:', error);
          await AsyncStorage.multiRemove(['userToken', 'userEmail', 'userPassword']);
          resolve(null);
        }
      } else if (email && password) {
        // Re-authenticate with stored credentials
        try {
          const result = await signInWithEmail(email, password);
          console.log('Restored session with credentials, new token:', await result.getIdToken());
          resolve(result);
        } catch (error) {
          console.error('Re-auth error:', error);
          await AsyncStorage.multiRemove(['userToken', 'userEmail', 'userPassword']);
          resolve(null);
        }
      } else {
        await AsyncStorage.multiRemove(['userToken', 'userEmail', 'userPassword']);
        resolve(null);
      }
      unsubscribe();
    });
  });
};

export const signInWithCredentialHelper = async (authInstance: Auth, credential: AuthCredential): Promise<UserCredential> => {
  return signInWithCredential(authInstance, credential);
};

export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut();
    await AsyncStorage.multiRemove(['userToken', 'userEmail', 'userPassword']);
    console.log('User signed out, token and credentials removed');
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export { onAuthStateChanged, signInWithEmailAndPassword };