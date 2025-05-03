// src/types/react-native-svg-charts/index.d.ts
import { ComponentType } from 'react'
import { PathProps } from 'react-native-svg'

declare module 'react-native-svg-charts' {
  export interface GridProps {}
  export const Grid: ComponentType<GridProps>

  export interface ChartProps {
    style?: any
    data: number[]
    svg?: PathProps | any
    contentInset?: { top: number; bottom: number }
    children?: React.ReactNode
  }

  export const LineChart: ComponentType<ChartProps>
  export const BarChart: ComponentType<ChartProps>
}