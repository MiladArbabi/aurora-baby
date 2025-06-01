import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, Button, StyleSheet } from 'react-native'
import { StackScreenProps } from '@react-navigation/stack'
import { OnboardingParamList } from '../../navigation/OnboardingNavigator'
import { saveChildProfile, getChildProfile } from '../../services/ChildProfileAccess'
import * as Speech from 'expo-speech'

const ALL_THEMES = ['Animals','Adventure','Magic','Calming','Music','Forest','Night']

type Props = StackScreenProps<OnboardingParamList, 'Themes'>

export default function ThemePreferencesScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([])
  
  useEffect(() => {
          Speech.speak('What themes does your child love? Tap to select one or more options.')
          return () => {
            Speech.stop()
          }
        }, [])

  const toggle = (theme: string) => {
    setSelected(sel =>
      sel.includes(theme) ? sel.filter(t=>t!==theme) : [...sel, theme]
    )
  }

  const onNext = async () => {
    const profile = await getChildProfile()
    if (!profile) return
    await saveChildProfile({ ...profile, themePreferences: selected })
    navigation.navigate('Done')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>What themes does your child love?</Text>
      <View style={styles.grid}>
        {ALL_THEMES.map(theme => (
          <TouchableOpacity
            key={theme}
            onPress={() => toggle(theme)}
            style={[
              styles.tile,
              selected.includes(theme) && styles.tileSelected
            ]}
          >
            <Text style={selected.includes(theme) ? styles.textSelected : styles.text}>
              {theme}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Finish" onPress={onNext} disabled={selected.length===0} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, justifyContent:'center' },
  header: { fontSize:24, textAlign:'center', marginBottom:24 },
  grid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-around' },
  tile: {
    borderWidth:1, borderColor:'#aaa', borderRadius:8,
    padding:12, margin:6, minWidth:100, alignItems:'center'
  },
  tileSelected: { backgroundColor:'#cceeff', borderColor:'#66bbff' },
  text: { color:'#333' },
  textSelected: { color:'#0066cc', fontWeight:'bold' },
})
