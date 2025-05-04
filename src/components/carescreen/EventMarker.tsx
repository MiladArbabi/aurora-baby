// src/components/carescreen/EventMarker.tsx
import React from 'react'
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native'

interface Props {
  size: number            // Tracker diameter
  fraction: number        // 0–1 around the circle
  color: string
  testID?: string
  onPress?: (e: GestureResponderEvent) => void
  ringStrokeWidth?: number  // <— NEW
}

const EventMarker: React.FC<Props> = ({
  size,
  fraction,
  color,
  testID,
  onPress,
  ringStrokeWidth = 0,       // <— default if you don’t pass it
}) => {
  // compute the “inner” radius at the center of your main arc
  const fullRadius = size / 2
  const placementRadius = fullRadius - ringStrokeWidth / 2

  // convert fraction to coordinates
  const angle = fraction * 2 * Math.PI - Math.PI / 2
  const x = fullRadius + placementRadius * Math.cos(angle)
  const y = fullRadius + placementRadius * Math.sin(angle)

  const markerSize = 42  // whatever diameter you like
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
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
      ]}
    />
  )
}

export default EventMarker

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
  },
})
