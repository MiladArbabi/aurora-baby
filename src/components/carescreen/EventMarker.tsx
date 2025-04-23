import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from 'react-native'

interface Props {
  size: number           // Tracker diameter
  fraction: number       // 0–1 around the circle
  color: string
  testID?: string
  onPress?: (e: GestureResponderEvent) => void
}

const EventMarker: React.FC<Props> = ({
  size,
  fraction,
  color,
  testID,
  onPress,
}) => {
  const radius = size / 2
  const angle = fraction * 2 * Math.PI - Math.PI / 2
  const x = radius + radius * Math.cos(angle)
  const y = radius + radius * Math.sin(angle)

  const markerSize = 50

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
        },
      ]}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: color, borderRadius: markerSize / 2 },
        ]}
      />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
    elevation: 100,
  },
})

export default EventMarker