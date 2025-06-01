// src/screens/onboarding/ParentInfoScreen.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { OnboardingParamList } from '../../navigation/OnboardingNavigator'
import { saveParentProfile } from '../../services/ParentProfileAccess'
import * as Speech from 'expo-speech'

type Props = StackScreenProps<OnboardingParamList, 'Parent'>

export default function ParentInfoScreen({ navigation }: Props) {
  const [name, setName] = useState('')

  useEffect(() => {
        Speech.speak('Tell us about you. Please enter your name.')
        return () => {
          Speech.stop()
        }
      }, [])

  const onNext = async () => {
    await saveParentProfile({ name: name.trim() })
    navigation.navigate('Child')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>About You</Text>
      <TextInput
        placeholder="Your name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <Button title="Next" onPress={onNext} disabled={!name.trim()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  header: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
})
