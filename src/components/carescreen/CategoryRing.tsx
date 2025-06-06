// src/components/carescreen/CategoryRing.tsx
import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { ViewStyle, StyleProp } from 'react-native'
import type { LogSlice } from '../../models/LogSlice'

interface CategoryRingProps {
  size: number  
  style?: StyleProp<ViewStyle>
  strokeWidth: number        // thickness of this ring
  fillColor: string           // color to fill when mask[h] === true
  separatorColor?: string    // same faint lines as SliceRing
  testID?: string
  accessible?: boolean       // for accessibility purposes
  accessibilityLabel?: string
  slices: LogSlice[];            // ← new: array of LogSlice
  fallbackMask?: boolean[]; 
  onSlicePress?: (slice: LogSlice) => void // callback when a slice is pressed
  dimFuture?: number // if true, dims future slices
}

const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

const describeSlice = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) => {
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle)
  const outerEnd   = polarToCartesian(centerX, centerY, outerRadius, startAngle)
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle)
  const innerEnd   = polarToCartesian(centerX, centerY, innerRadius, endAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ')
}

const CategoryRing: React.FC<CategoryRingProps> = ({
  size,
  strokeWidth,
  fillColor,
  separatorColor = 'rgba(0,0,0,0.1)',
  testID,
  onSlicePress,
  slices,
  style,
  dimFuture
}) => {
  const center = size / 2
  const outerRadius = size / 2
  const innerRadius = outerRadius - strokeWidth

  // Convert a timestamp to angle (in degrees)
  const timeToAngle = (iso: string) => {
      const date = new Date(iso)
      const totalMinutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
      return (totalMinutes / (24 * 60)) * 360
    }
  
    // Build filled slices from LogSlice array
    const filledSlices: React.ReactNode[] = slices.map((slice) => {
      const startAngle = timeToAngle(slice.startTime)
      const endAngle = timeToAngle(slice.endTime)
      const pathD = describeSlice(center, center, innerRadius, outerRadius, startAngle, endAngle)
      return (
        <Path
          key={slice.id}
          d={pathD}
          fill={fillColor}
          onPress={() => onSlicePress?.(slice)}
        />
      )
    })

  const separators: React.ReactNode[] = []

  for (let i = 0; i < 24; i++) {
    const startAngle = (i * 360) / 24
    const endAngle   = ((i + 1) * 360) / 24
    const d = describeSlice(center, center, innerRadius, outerRadius, startAngle, endAngle)

    // draw the faint slice border on top
    separators.push(
      <Path
        key={`sep-${i}`}
        d={d}
        fill="transparent"
        stroke={separatorColor}
        strokeWidth={1}
      />
    )
  }

  return (
    <Svg width={size} height={size} testID={testID}>
      {filledSlices}
      {separators}
    </Svg>
  )
}

export default CategoryRing
