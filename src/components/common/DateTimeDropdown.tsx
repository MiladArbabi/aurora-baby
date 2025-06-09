// src/components/common/DateTimeDropdown.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { boolean } from 'zod'

interface DateTimeDropdownProps {
    label: string
    value: Date
    onChange: (newDate: Date) => void
    disabled?: boolean
    accessibilityLabel: string
  }

export const DateTimeDropdown: React.FC<DateTimeDropdownProps> = ({ 
    label,
  value,
  onChange,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false)
  const [mode, setMode] = useState<'date' | 'time'>('date')

  const handlePress = (m: 'date' | 'time') => {
    setMode(m)
    setShowPicker(true)
  }

  const handleChange = (_: any, selected?: Date) => {
    setShowPicker(false)
    if (selected) onChange(selected)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity 
        onPress={() => handlePress('date')} 
        style={styles.button}
        disabled={disabled}
        >
          <Text style={styles.buttonText}>{value.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
        onPress={() => handlePress('time')} 
        style={styles.button}
        disabled={disabled}
        >
          <Text style={styles.buttonText}>{value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </TouchableOpacity>
      </View>
      {showPicker && (
        <DateTimePicker
          testID="date-time-picker"
          value={value}
          mode={mode}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: { fontSize: 14, color: '#E9DAFA', marginBottom: 4 },
  buttons: { flexDirection: 'row', justifyContent: 'space-between' },
  button: {
    flex: 1,
    padding: 12,
    backgroundColor: '#D7D7D7',
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: { fontSize: 14, color: '#000' },
})