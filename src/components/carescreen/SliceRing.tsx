// src/components/carescreen/SliceRing.tsx
import React from 'react'
import Svg, { Path } from 'react-native-svg'

interface SliceRingProps {
  size: number            // full width/height of the SVG
  strokeWidth: number     // thickness of the donut ring
  separatorColor?: string // color for the faint dividing lines
  testID?: string
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

/**
 * Build an SVG path for a single “slice” of a donut (an annulus segment)
 * spanning [startAngle → endAngle], between innerRadius and outerRadius.
 */
const describeSlice = (
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number
) => {
  // Compute key points:
  const outerStart = polarToCartesian(centerX, centerY, outerRadius, endAngle)
  const outerEnd   = polarToCartesian(centerX, centerY, outerRadius, startAngle)
  const innerStart = polarToCartesian(centerX, centerY, innerRadius, startAngle)
  const innerEnd   = polarToCartesian(centerX, centerY, innerRadius, endAngle)

  // If arc is > 180°, largeArcFlag = 1; otherwise 0
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  // Path syntax:
  //  M → Move to outerStart
  //  A → Arc along outer radius down to outerEnd
  //  L → Line (straight) from outerEnd to innerStart
  //  A → Arc (reversed) along inner radius from innerStart → innerEnd
  //  Z → Close back to outerStart
  return [
    // Move to the “beginning” of the outer arc
    `M ${outerStart.x} ${outerStart.y}`,
    // Draw outer arc
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${outerEnd.x} ${outerEnd.y}`,
    // Draw inward line from outerEnd → innerStart
    `L ${innerStart.x} ${innerStart.y}`,
    // Draw inner arc (reversed direction)
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${innerEnd.x} ${innerEnd.y}`,
    // Close the shape
    'Z',
  ].join(' ')
}

const SliceRing: React.FC<SliceRingProps> = ({
  size,
  strokeWidth,
  separatorColor = 'rgba(0,0,0,0.1)',
  testID
}) => {
  // radius of outer circle
  const center = size / 2
  const outerRadius = size / 2
  const innerRadius = outerRadius - strokeWidth

  // Generate 24 equal slices (360°/24 = 15° each)
  const slices = []
  for (let i = 0; i < 24; i++) {
    const startAngle = (i * 360) / 24
    const endAngle   = ((i + 1) * 360) / 24

    // Build the path for this single slice
    const d = describeSlice(
      center,
      center,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    )

    slices.push(
      <Path
        key={i}
        d={d}
        fill="transparent"
        stroke={separatorColor}
        strokeWidth={1}
      />
    )
  }

  return (
    <Svg width={size} height={size} testID={testID}>
      {slices}
    </Svg>
  )
}

export default SliceRing
