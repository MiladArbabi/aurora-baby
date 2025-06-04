// src/components/carescreen/EventMarker.tsx
import React from 'react'
import { StyleSheet, GestureResponderEvent, TouchableOpacity, ViewStyle, StyleProp } from 'react-native'
import { QuickLogEntry } from '../../models/QuickLogSchema'

import SleepButton from '../../assets/carescreen/QuickLogMenu/SleepButton';
import NotesButton from '../../assets/carescreen/QuickLogMenu/NotesButton';
import FeedButton from '../../assets/carescreen/QuickLogMenu/FeedingButton';
import DiaperButton from '../../assets/carescreen/QuickLogMenu/DiaperButton';
import MoodButton from '../../assets/carescreen/QuickLogMenu/MoodButton';
import HealthButton from '../../assets/carescreen/QuickLogMenu/HealthButton';

interface Props {
  size: number            // Tracker diameter
  fraction: number        // 0–1 around the circle
  color: string
  testID?: string
  onPress?: (e: GestureResponderEvent) => void
  ringStrokeWidth?: number 
  type?: QuickLogEntry['type'] 
  style?: StyleProp<ViewStyle>
}

const EventMarker: React.FC<Props> = ({
  size,
  fraction,
  color,
  testID,
  onPress,
  ringStrokeWidth = 0,  
  type, 
  style 
}) => {
  // compute the “inner” radius at the center of your main arc
  const fullRadius = size / 2
  const placementRadius = fullRadius - ringStrokeWidth / 2

  // convert fraction to coordinates
  const angle = fraction * 2 * Math.PI - Math.PI / 2
  const x = fullRadius + placementRadius * Math.cos(angle)
  const y = fullRadius + placementRadius * Math.sin(angle)

  const markerSize = 42

const iconMap = {
  sleep: SleepButton,
  feeding: FeedButton,
  diaper: DiaperButton,
  mood: MoodButton,
  health: HealthButton,
  note: NotesButton,
} as const

  const IconComponent = type ? iconMap[type] : null

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      accessibilityLabel={`${type ?? 'event'} marker`}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          left: x - markerSize / 2,
          top:  y - markerSize / 2,
          width:  markerSize,
          height: markerSize,
          borderRadius: markerSize / 2,
          backgroundColor: color,
        },
        style
      ]}
    >
    {IconComponent && (
      <IconComponent
        width={markerSize}
        height={markerSize}
        fill="#FFFFFF" 
        />
    )}
    </TouchableOpacity>

  )
}

export default EventMarker

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
})
