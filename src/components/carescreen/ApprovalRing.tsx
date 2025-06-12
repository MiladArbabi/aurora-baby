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

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg - 90) * (Math.PI / 180)
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }
  
  function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
  
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

const ApprovalRing: React.FC<ApprovalRingProps> = ({
  size,
  strokeWidth,
  logSlices,
  style,
}) => {


    const hourBuckets: LogSlice[][] = Array.from({ length: 24 }, () => [])

    for (const slice of logSlices) {
      const startHour = new Date(slice.startTime).getHours()
      hourBuckets[startHour].push(slice)
    }
    
    // Determine color status for each hour
    const hourColors: string[] = hourBuckets.map((logsInHour) => {
      const hasUnapproved = logsInHour.some(log => log.isAiSuggested)
      return hasUnapproved ? '#E53935' : '#4CAF50' // red : green
    })

    const cx = size / 2
const cy = size / 2
const radius = (size - strokeWidth) / 2

const segments = hourColors.map((color, hour) => {
  const startAngle = (hour / 24) * 360
  const endAngle = ((hour + 1) / 24) * 360
  const pathData = describeArc(cx, cy, radius, startAngle, endAngle)

  return (
    <Path
      key={`arc-${hour}`}
      d={pathData}
      stroke={color}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
    />
  )
})

return (
    <View style={style}>
      <Svg width={size} height={size}>
        {segments}
      </Svg>
    </View>
  )
}

export default ApprovalRing
