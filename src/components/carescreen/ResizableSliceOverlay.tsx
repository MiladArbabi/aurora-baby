import React, { useRef, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler'
import Svg, { Circle, Line, G } from 'react-native-svg'
import type { LogSlice } from '../../models/LogSlice'

interface ResizableSliceOverlayProps {
  size: number
  strokeWidth: number
  slices: LogSlice[]
  onResize: (id: string, newStartAngle?: number, newEndAngle?: number) => void
}

// Helper to convert polar coords to cartesian
const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const angleRad = (angleDeg - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

export default function ResizableSliceOverlay({ size, strokeWidth, slices, onResize }: ResizableSliceOverlayProps) {
  const center = size / 2
  const radius = center - strokeWidth / 2

  // refs to track which handle is active
  const activeHandle = useRef<{ id: string; type: 'start' | 'end' } | null>(null)
  const [active, setActive] = useState<{id:string,type:'start'|'end'}|null>(null)

  const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
    console.log(`[Overlay] gesture moved: active=${!!activeHandle.current}`)
    if (!activeHandle.current) return
    // compute angle from center to touch
    const { x, y } = e.nativeEvent
    const dx = x - center
    const dy = y - center
    let angle = Math.atan2(dy, dx) + Math.PI / 2
    if (angle < 0) angle += 2 * Math.PI
    const angleDeg = (angle * 180) / Math.PI

    // callback with new angle
    if (activeHandle.current.type === 'start') {
      onResize(activeHandle.current.id, angleDeg, undefined)
    } else {
      onResize(activeHandle.current.id, undefined, angleDeg)
    }
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Svg width={size} height={size}>
        {slices.map(slice => {
          // compute slice angular bounds
          const start = new Date(slice.startTime)
          const end = new Date(slice.endTime)
          const toAngle = (d: Date) => ((d.getHours() * 60 + d.getMinutes() + d.getSeconds()/60) / (24*60)) * 360
          const startAngle = toAngle(start)
          const endAngle = toAngle(end)
          const startPt = polarToCartesian(center, center, radius, startAngle)
          const endPt = polarToCartesian(center, center, radius, endAngle)

            // compute an “offset” when dragging
            const lift = active && active.id === slice.id ? 4 : 0
            const midAngle = (startAngle + endAngle) / 2
            const liftX = lift * Math.cos((midAngle - 90) * Math.PI/180)
            const liftY = lift * Math.sin((midAngle - 90) * Math.PI/180)

          return (
            <G key={slice.id} transform={`translate(${liftX},${liftY})`}>
              {/* start handle */}
              <PanGestureHandler
                onBegan={() => { 
                  console.log(`[Overlay] start-handle down on ${slice.id}`)
                  activeHandle.current = { id: slice.id, type: 'start' }
                  setActive({ id: slice.id, type: 'start' })
                }}
                onGestureEvent={onGestureEvent}
                onEnded={() => { 
                  console.log(`[Overlay] start-handle up on ${slice.id}`)
                  activeHandle.current = null
                  setActive(null)
                }}
              >
            
                <Circle
                  cx={startPt.x} 
                  cy={startPt.y}
                  r={active?.id === slice.id && active?.type === 'start' ? strokeWidth * 0.7 : strokeWidth * 0.5}
                  fill="white" 
                  stroke="#444" 
                  strokeWidth={active?.id === slice.id && active?.type === 'start' ? 2 : 1}
                />
              </PanGestureHandler>

              {/* end handle */}
              <PanGestureHandler
                onBegan={() => { 
                  console.log(`[Overlay] end-handle down on ${slice.id}`)
                  activeHandle.current = { id: slice.id, type: 'end' } 
                  setActive({ id: slice.id, type: 'end' })
                }}
                onGestureEvent={onGestureEvent}
                onEnded={() => { 
                  console.log(`[Overlay] end-handle up on ${slice.id}`)
                  activeHandle.current = null 
                  setActive(null)
                }}
              >
                <Circle
                  cx={endPt.x} 
                  cy={endPt.y}
                  r={active?.id === slice.id && active?.type === 'end' ? strokeWidth * 0.7 : strokeWidth * 0.5}
                  fill="white" 
                  stroke="#444" 
                  strokeWidth={active?.id === slice.id && active?.type === 'end' ? 2 : 1}
                />
              </PanGestureHandler>
            </G>
          )
        })}
      </Svg>
    </View>
  )
}
