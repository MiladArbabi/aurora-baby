// src/components/common/MoodSelector.tsx
import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

export type Mood = 'happy' | 'neutral' | 'fussy' | 'sleepy' | 'hungry'

interface MoodSelectorProps {
  label: string
  value?: Mood
  onSelect: (mood: Mood) => void
  disabled?: boolean
}

const moods: { key: Mood; label: string }[] = [
  { key: 'happy', label: '😊' },
  { key: 'neutral', label: '😐' },
  { key: 'fussy', label: '😣' },
  { key: 'sleepy', label: '😴' },
  { key: 'hungry', label: '😋' },
]

export const MoodSelector: React.FC<MoodSelectorProps> = ({ 
    label, 
    value, 
    onSelect,
    disabled = false,
 }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {moods.map(m => (
          <TouchableOpacity
            key={m.key}
            style={[
              styles.moodBtn,
              value === m.key ? styles.selected : undefined,
            ]}
            onPress={() => onSelect(m.key)}
            disabled={disabled}  
          >
            <Text style={styles.moodText}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontSize: 14, color: '#E9DAFA', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  moodBtn: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#D7D7D7',
    marginHorizontal: 4,
  },
  selected: { backgroundColor: '#E9DAFA' },
  moodText: { fontSize: 18 },
})