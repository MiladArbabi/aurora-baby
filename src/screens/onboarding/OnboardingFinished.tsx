// src/screens/onboarding/OnboardingFinished.tsx
import React, { useEffect } from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as Speech from 'expo-speech'

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
    // Simply pop this “Done” screen. On unmounting, AppNavigator
    // sees profile !== null and automatically swaps to Home.
    nav.goBack()
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
