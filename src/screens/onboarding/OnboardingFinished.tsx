// src/screens/onboarding/OnboardingFinished.tsx
import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { useNavigation, CommonActions, NavigationProp } from '@react-navigation/native'
import { saveChildProfile } from '../../storage/ChildProfileStorage'
import { saveParentProfile } from '../../storage/ParentProfileStorage'  // you’ll create this
import AsyncStorage from '@react-native-async-storage/async-storage'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/AppNavigator'

export default function OnboardingFinished() {
  const nav = useNavigation<NavigationProp<RootStackParamList>>();

  const handleDone = async () => {
    // (1) Persist both profiles (you already saved them in earlier steps)
    //     but if you haven’t, you can fetch them here from a temp store
    // saveParentProfile(parent)
    // saveChildProfile(child)

    // (2) reset the navigation stack so “Home” becomes the root
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
        You’ll now be taken to your dashboard.
      </Text>
      <Button title="Get started" onPress={handleDone} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', alignItems:'center', padding:16 },
  title:     { fontSize:24, fontWeight:'bold', marginBottom:16 },
  sub:       { fontSize:16, textAlign:'center', marginBottom:32 },
})
