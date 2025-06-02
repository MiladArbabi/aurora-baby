// src/screens/onboarding/ChildProfileScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { OnboardingParamList } from '../../navigation/OnboardingNavigator'
import { saveChildProfile } from '../../services/ChildProfileAccess'
import * as Speech from 'expo-speech'

type Props = StackScreenProps<OnboardingParamList, 'Child'>

export default function ChildProfileScreen({ navigation }: Props) {
  const [name, setName] = useState<string>('')
  const [dobText, setDobText] = useState<string>('') // expects YYYY-MM-DD

  useEffect(() => {
    Speech.speak(
      'About your child. Please enter your child’s name and date of birth.'
    )
    return () => {
      Speech.stop()
    }
  }, [])

  const validateDateString = (s: string): boolean => {
    // Basic YYYY-MM-DD validation
    const regex = /^\d{4}-\d{2}-\d{2}$/
    if (!regex.test(s)) return false
    const [year, month, day] = s.split('-').map((t) => parseInt(t, 10))
    if (month < 1 || month > 12) return false
    if (day < 1 || day > 31) return false
    // (You can add extra checks for month lengths / leap years if desired)
    return true
  }

  const onNext = async () => {
    if (!validateDateString(dobText.trim())) {
      Alert.alert('Invalid date', 'Please use YYYY-MM-DD format.')
      return
    }

    const isoString = new Date(dobText.trim() + 'T00:00:00').toISOString()
    await saveChildProfile({
      id: Date.now().toString(),
      name: name.trim(),
      dob: isoString,
      themePreferences: [],
    })
    navigation.navigate('Themes')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>About Your Child</Text>

      <TextInput
        placeholder="Child’s name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        placeholder="Date of Birth (YYYY-MM-DD)"
        value={dobText}
        onChangeText={setDobText}
        style={styles.input}
        autoCapitalize="none"
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
      />

      <Button
        title="Next"
        onPress={onNext}
        disabled={!name.trim() || !dobText.trim()}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  header: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
})
