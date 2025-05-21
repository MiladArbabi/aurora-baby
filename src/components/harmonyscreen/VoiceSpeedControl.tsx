// src/components/harmonyscreen/VoiceSpeedControl.tsx

import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTheme } from 'styled-components/native'

interface VoiceSpeedControlProps {
  rate: number
  onChangeRate: (newRate: number) => void
}

// Allowed speeds
const SPEEDS = [0.5, 1.0, 1.5, 2.0]

export const VoiceSpeedControl: React.FC<VoiceSpeedControlProps> = ({
  rate,
  onChangeRate,
}) => {
  const theme = useTheme()
  // find current index
  const idx = SPEEDS.indexOf(rate)
  
  const decrease = () => {
    if (idx > 0) onChangeRate(SPEEDS[idx - 1])
  }
  const increase = () => {
    if (idx < SPEEDS.length - 1) onChangeRate(SPEEDS[idx + 1])
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={decrease}
        disabled={idx <= 0}
        style={styles.button}
        accessibilityLabel="Decrease speech rate"
      >
        <Text style={[styles.symbol, { color: idx > 0 ? theme.colors.primary : theme.colors.muted }]}>
          –
        </Text>
      </TouchableOpacity>

      <Text style={[styles.rateText, { color: theme.colors.text }]}>
        {rate.toFixed(1)}×
      </Text>

      <TouchableOpacity
        onPress={increase}
        disabled={idx >= SPEEDS.length - 1}
        style={styles.button}
        accessibilityLabel="Increase speech rate"
      >
        <Text style={[styles.symbol, { color: idx < SPEEDS.length - 1 ? theme.colors.primary : theme.colors.muted }]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 8,
  },
  symbol: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rateText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: '500',
  },
})