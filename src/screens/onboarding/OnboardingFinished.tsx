// src/screens/onboarding/OnboardingFinished.tsx
import React, { useEffect } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as Speech from 'expo-speech'
import { CommonActions } from '@react-navigation/native'

// We do NOT dispatch any RESET → “Home” here. Instead, once the child_profile is saved,
// AppNavigator will automatically re‐render and show the “Home” stack.

export default function OnboardingFinished() {
  const nav = useNavigation()

  useEffect(() => {
    Speech.speak('All set! Welcome to Aurora Baby.')
    return () => {
      Speech.stop()
    }
  }, [])

  const handleDone = () => {
    // Reset the navigation state so Home is the only screen
    nav.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All set! 🎉</Text>
      <Text style={styles.sub}>
        Welcome to Aurora Baby.
      </Text>
      <Button title="Get started" onPress={handleDone} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  sub: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
})
