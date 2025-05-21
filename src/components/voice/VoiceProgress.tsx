// src/components/voice/VoiceProgress.tsx

import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useTheme } from 'styled-components/native'

interface VoiceProgressProps {
  progress: number  // 0 to 1
}

export const VoiceProgress: React.FC<VoiceProgressProps> = ({ progress }) => {
  const theme = useTheme()
  return (
    <View style={styles.container}>
      <View style={[styles.filled, { flex: progress, backgroundColor: theme.colors.primary }]} />
      <View style={[styles.empty, { flex: 1 - progress, backgroundColor: theme.colors.muted }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  filled: {},
  empty: {},
})
