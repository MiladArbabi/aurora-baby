// src/components/carescreen/ApprovalRing.tsx
import React from 'react'
import Svg, { Path } from 'react-native-svg'
import { View, StyleProp, ViewStyle } from 'react-native'
import type { LogSlice } from '../../models/LogSlice'

interface ApprovalRingProps {
  size: number      // diameter
  strokeWidth: number
  logSlices: LogSlice[]
  confirmedIds: Set<string>
  style?: StyleProp<ViewStyle>
  onSectorPress?: (slice: LogSlice) => void
  nowFrac: number
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeSector(
  cx: number, cy: number, r: number,
  startAng: number, endAng: number
) {
  const p1 = polarToCartesian(cx, cy, r, startAng)
  const p2 = polarToCartesian(cx, cy, r, endAng)
  // largeArcFlag is 1 if the arc is >180°
  const largeArcFlag = endAng - startAng > 180 ? 1 : 0
  return `
    M ${cx} ${cy}
    L ${p1.x} ${p1.y}
    A ${r} ${r} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}
    Z
  `
}

export default function ApprovalRing({
  size,
  strokeWidth,
  logSlices,
  confirmedIds,
  style,
  onSectorPress
}: ApprovalRingProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = (size - strokeWidth) / 2

  const sliceCount = logSlices.length
  if (sliceCount === 0) return null

  // How big is each wedge?
  const fullDeg   = 360
  const gapDeg    = 2    // a tiny gap between wedges
  const perDeg    = fullDeg / sliceCount
  const spanDeg   = perDeg - gapDeg

  const sectors = logSlices.map((slice, i) => {
    const startAng = i * perDeg + gapDeg / 2
    const endAng   = startAng + spanDeg
    const d        = describeSector(cx, cy, radius, startAng, endAng)

    const isConfirmed = confirmedIds.has(slice.id)
    const fillColor   = isConfirmed ? '#4CAF50' : '#E53935'

    return (
      <Path
        key={slice.id}
        d={d}
        fill={fillColor}
        onPress={() => onSectorPress?.(slice)}
      />
    )
  })

  return (
    <View style={style}>
      <Svg width={size} height={size}>
        {sectors}
      </Svg>
    </View>
  )
}
