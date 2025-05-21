// src/components/voice/VoiceToggle.tsx

import React from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from 'styled-components/native'
import VoiceIcon from '../../assets/icons/common/VoiceIcon'  // import your play icon
import PauseIcon from '../../assets/icons/common/PauseIcon'  // you’ll need a PauseIcon

interface VoiceToggleProps {
  isSpeaking: boolean
  onPlay: () => void
  onPause: () => void
}

// We render a single <TouchableOpacity> that toggles between play & pause.
export const VoiceToggle: React.FC<VoiceToggleProps> = ({
  isSpeaking,
  onPlay,
  onPause,
}) => {
  const theme = useTheme()

  const handlePress = () => {
    if (isSpeaking) {
      onPause()
    } else {
      onPlay()
    }
  }

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      accessibilityLabel={isSpeaking ? 'Pause read aloud' : 'Play read aloud'}
      accessibilityRole="button"
    >
      {isSpeaking ? (
        <PauseIcon fill={theme.colors.primary} width={32} height={32} />
      ) : (
        <VoiceIcon fill={theme.colors.primary} width={32} height={32} />
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
