// src/components/carescreen/ApprovalRing.tsx
import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { View, StyleProp, ViewStyle } from 'react-native'
import type { LogSlice } from '../../models/LogSlice'

interface ApprovalRingProps {
  size: number // diameter of the ring
  strokeWidth: number
  logSlices: LogSlice[]
  style?: StyleProp<ViewStyle>
}

const ApprovalRing: React.FC<ApprovalRingProps> = ({
  size,
  strokeWidth,
  logSlices,
  style,
}) => {
  // Placeholder for now — will add drawing logic next
  return (
    <View style={style}>
      <Svg width={size} height={size}>
        {/* curved segments will go here */}
      </Svg>
    </View>
  )
}

export default ApprovalRing
