// src/services/firebase.ts

import { initializeApp } from 'firebase/app'
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  User,
  UserCredential,
} from 'firebase/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Constants from 'expo-constants'
import { signInWithGoogleAsync } from './googleAuth'

// 1) Initialize Firebase app with your Expo config
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || 'YOUR_API_KEY',
  authDomain:
    Constants.expoConfig?.extra?.firebaseAuthDomain ||
    'your-app.firebaseapp.com',
  projectId:
    Constants.expoConfig?.extra?.firebaseProjectId || 'your-app-id',
  storageBucket:
    Constants.expoConfig?.extra?.firebaseStorageBucket ||
    'your-app.appspot.com',
  messagingSenderId:
    Constants.expoConfig?.extra?.firebaseMessagingSenderId || 'YOUR_SENDER_ID',
  appId:
    Constants.expoConfig?.extra?.firebaseAppId || 'YOUR_IOS_ANDROID_APP_ID',
  measurementId:
    Constants.expoConfig?.extra?.firebaseMeasurementId || 'G-XXXXXXXXXX',
}

if (!firebaseConfig.apiKey) {
  throw new Error(
    'Firebase API key is missing. Please check your app.config.js extra fields.'
  )
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

// 2) Google sign-in using expo-google-auth-session (or your own wrapper)
export async function signInWithGoogle(): Promise<User> {
  // `signInWithGoogleAsync` should return an object { idToken, accessToken }
  const { idToken, accessToken } = await signInWithGoogleAsync()

  // Build a Google credential with the token
  const credential = GoogleAuthProvider.credential(idToken, accessToken)
  const userCredential: UserCredential = await signInWithCredential(
    auth,
    credential
  )
  await AsyncStorage.removeItem('@child_profile')
  await AsyncStorage.removeItem('@parent_profile')
  return userCredential.user
}

// 3) Email/password sign-in
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user
    const token = await user.getIdToken()
    await AsyncStorage.setItem('userToken', token)
    await AsyncStorage.setItem('userEmail', email)
    await AsyncStorage.setItem('userPassword', password)

    // Only clear child_profile if this email differs from the one that was stored,
    // so existing users who already have a profile don’t get forced through onboarding again.
    const storedEmail = await AsyncStorage.getItem('userEmail')
    if (storedEmail !== email) {
      await AsyncStorage.removeItem('@child_profile')
      await AsyncStorage.removeItem('@parent_profile')
    }

    return user
  } catch (error) {
    console.error('Email Sign-In Error:', error)
    throw error
  }
}

// 4) Email/password sign-up
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )
    const user = userCredential.user
    const token = await user.getIdToken()
    await AsyncStorage.setItem('userToken', token)
    await AsyncStorage.setItem('userEmail', email)
    await AsyncStorage.setItem('userPassword', password)
    
    // A brand‐new user should never have a child profile yet—clear just in case
    await AsyncStorage.removeItem('@child_profile')

    return user
  } catch (error) {
    console.error('Email Sign-Up Error:', error)
    throw error
  }
}

// 5) Rehydrate auth state on app launch
export const checkAuthState = async (): Promise<User | null> => {
  const token = await AsyncStorage.getItem('userToken')
  const email = await AsyncStorage.getItem('userEmail')
  const password = await AsyncStorage.getItem('userPassword')

  if (!token) return null

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          try {
            const newToken = await user.getIdToken(true)
            await AsyncStorage.setItem('userToken', newToken)
            resolve(user)
          } catch (err) {
            console.error('Token refresh error:', err)
            await AsyncStorage.multiRemove([
              'userToken',
              'userEmail',
              'userPassword',
            ])
            resolve(null)
          }
        } else if (email && password) {
          // If no current user, try to sign in with stored credentials
          try {
            const restored = await signInWithEmail(email, password)
            resolve(restored)
          } catch (err) {
            console.error('Re-auth error:', err)
            await AsyncStorage.multiRemove([
              'userToken',
              'userEmail',
              'userPassword',
            ])
            resolve(null)
          }
        } else {
          await AsyncStorage.multiRemove([
            'userToken',
            'userEmail',
            'userPassword',
          ])
          resolve(null)
        }
        unsubscribe()
      },
      (error) => {
        console.error('onAuthStateChanged error:', error)
        unsubscribe()
        resolve(null)
      }
    )
  })
}

// 6) Sign out
export const signOut = async (): Promise<void> => {
  try {
    await auth.signOut()
    await AsyncStorage.multiRemove(['userToken', 'userEmail', 'userPassword'])
    await AsyncStorage.removeItem('@child_profile')
    await AsyncStorage.removeItem('@parent_profile')
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}
