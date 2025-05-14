// src/screens/onboarding/WelcomeScreen.tsx
import React from 'react'
import { View, Text, StyleSheet, Button } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { OnboardingParamList } from '../../navigation/OnboardingNavigator'

type Props = StackScreenProps<OnboardingParamList, 'Welcome'>

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Aurora Baby!</Text>
      <Text style={styles.subtitle}>
        Let’s get to know you and your little one.
      </Text>
      <Button
        title="Get Started"
        onPress={() => navigation.navigate('Parent')}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
})