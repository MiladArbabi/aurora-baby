// src/screens/onboarding/ChildProfileScreen.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { OnboardingParamList } from '../../navigation/OnboardingNavigator'
import { saveChildProfile } from '../../services/ChildProfileAccess'

type Props = StackScreenProps<OnboardingParamList, 'Child'>

export default function ChildProfileScreen({ navigation }: Props) {
  const [name, setName] = useState('')
  const [dob, setDob] = useState('') // e.g. YYYY-MM-DD

  const onNext = async () => {
    await saveChildProfile({ id: Date.now().toString(), name: name.trim(), dob })
    navigation.navigate('Themes')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>About Your Child</Text>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="DOB (YYYY-MM-DD)" value={dob} onChangeText={setDob} style={styles.input} />
      <Button title="Next" onPress={onNext} disabled={!name.trim() || !dob.trim()} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  header: { fontSize: 24, marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
})
