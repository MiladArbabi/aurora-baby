// src/components/carescreen/GaugeChart.tsx
import React from 'react'
import { View, StyleSheet } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'

// import the shared type
import { Segment } from './ChartCard'

export interface GaugeProps {
  size: number
  segments: Segment[]
}

const GaugeChart: React.FC<GaugeProps> = ({ size, segments }) => {
  const strokeWidth = 12
  const radius      = (size - strokeWidth) / 2
  const circ        = 2 * Math.PI * radius

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size/2},${size/2}`}>
          {/* full‐circle background */}
          <Circle
            cx={size/2} cy={size/2} r={radius}
            stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth}
          />
          {/* one arc per segment */}
          {segments.map((seg, i) => {
            const segLen     = (seg.to - seg.from) * circ
            const dashOffset = circ * (1 - seg.to)
            return (
              <Circle
                key={i}
                cx={size/2} cy={size/2} r={radius}
                stroke={seg.color} strokeWidth={strokeWidth}
                strokeDasharray={`${segLen},${circ}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            )
          })}
        </G>
      </Svg>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
})

export default GaugeChart