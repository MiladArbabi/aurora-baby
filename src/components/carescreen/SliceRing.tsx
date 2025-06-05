// src/components/carescreen/SliceRing.tsx
import React from 'react'
import Svg, { Path, Line, Circle } from 'react-native-svg'

// categories for each hour
export type SliceCategory = 'sleep' | 'play' | 'feedDiaper' | 'showerEss'

interface SliceRingProps {
  size: number            // full width/height of the SVG
  strokeWidth: number     // thickness of the donut ring
  separatorColor?: string // color for the faint dividing lines
  testID?: string
  categories: SliceCategory[]
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

// define fill color for each category (dark and light variants)
const categoryColorMap: Record<SliceCategory, string> = {
      sleep:      '#A3B1E0',      // e.g. light‐blue
      play:       '#C8E6C9',      // e.g. light‐green
      feedDiaper: '#FFE0B2',      // e.g. light‐orange
      showerEss:  '#F0F4C3',      // e.g. light‐yellow
    }

const SliceRing: React.FC<SliceRingProps> = ({
  size,
  strokeWidth,
  separatorColor = 'rgba(0,0,0,0.1)',
  categories,
  testID
}) => {
  // radius of outer circle
  const center = size / 2
  const outerRadius = size / 2
  const innerRadius = outerRadius - strokeWidth

  // build each slice path and optionally fill
  const filledSlices = []
  for (let i = 0; i < 24; i++) {
    const startAngle = (i * 360) / 24
    const endAngle   = ((i + 1) * 360) / 24

    const d = describeSlice(
      center,
      center,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    )

    // fill based on category
    const fillColor = categoryColorMap[categories[i]] || 'transparent'
    filledSlices.push(
      <Path
        key={`fill-${i}`}
        d={d}
        fill={fillColor}
        stroke="none"
      />
    )
  }

  // old “separator” slices are now drawn on top of fills
  const separators = []
  for (let i = 0; i < 24; i++) {
    const startAngle = (i * 360) / 24
    const endAngle   = ((i + 1) * 360) / 24
    const d = describeSlice(
      center,
      center,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle
    )
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

  // ── 2) Radial divider lines ─────────────────────────────────
  // Draw 24 faint lines from center to outer radius, one at each 15° boundary
  const dividers = []
  for (let i = 0; i < 24; i++) {
    // angle in degrees, measured from vertical (0° = 12 o'clock)
    const angleDeg = (i * 360) / 24 - 90
    // convert to radians for math
    const angleRad = (angleDeg * Math.PI) / 180
    const x2 = center + outerRadius * Math.cos(angleRad)
    const y2 = center + outerRadius * Math.sin(angleRad)

    dividers.push(
      <Line
        key={`divider-${i}`}
        x1={center}
        y1={center}
        x2={x2}
        y2={y2}
        stroke={separatorColor}
        strokeWidth={1}
      />
    )
  }

  // ── 3) Faint circle boundaries ──────────────────────────────
  // Outer boundary at outerRadius
  const outerCircle = (
    <Circle
      cx={center}
      cy={center}
      r={outerRadius}
      stroke={separatorColor}
      strokeWidth={1}
      fill="none"
    />
  )
  // Inner boundary at innerRadius
  const innerCircle = (
    <Circle
      cx={center}
      cy={center}
      r={innerRadius}
      stroke={separatorColor}
      strokeWidth={1}
      fill="none"
    />
  )

  return (
    <Svg width={size} height={size} testID={testID}>
      {filledSlices}
      {separators}
      {dividers}
      {outerCircle}
      {innerCircle}
    </Svg>
  )
}

export default SliceRing
