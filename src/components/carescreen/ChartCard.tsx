import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart, BarChart, Grid, AreaChart, XAxis, YAxis } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { useTheme } from 'styled-components/native';
import GaugeChart from './GaugeChart';

export type LineBarSpec = {
    type: 'line' | 'bar';
    data: number[];
    svgProps: any;
    testID: string;
    title: string;
  };

  export type AreaSpec = {
    type:   'area'
    testID: string
    title:  string
    data:   number[]
    svgProps: {
      stroke: string
      fill:   string
      baseline: number
    }
  }
  
/** One slice of the 24h circle, from `from`→`to` (0–1 fraction), painted `color` */
export type Segment = {
    from: number
    to:   number
    color:string
  }
  
  export type GaugeSpec = {
    type:   'gauge'
    testID: string
    title:  string
    data:   { segments: Segment[] }
    svgProps?: any
  }

  export type ChartSpec = LineBarSpec | GaugeSpec | AreaSpec;

  export const ChartCard: React.FC<ChartSpec> = 
  ({ testID, title, type, data, svgProps }) => {
    const legendLabels = [
        'Night Sleep',     // 12 AM–4 AM
        'Morning Wake',    // 4 AM–8 AM
        'Nap 1',           // 8 AM–12 PM
        'Nap 2',           // 12 PM–4 PM
        'Nap 3',           // 4 PM–8 PM
        'Evening Wake',    // 8 PM–12 AM
      ];

      if (type === 'area') {
        const yBaseline = (data as number[]).map(() => svgProps.baseline);
        const values    = data as number[];
        const contentInset = { top: 20, bottom: 20 };
      
        return (
          <View style={styles.card}>
            <Text testID={testID} style={styles.cardTitle}>{title}</Text>
      
            <View style={{ flexDirection: 'row', height: 200, paddingHorizontal: 8 }}>
              {/* Y‐Axis */}
              <YAxis
                data={values}
                contentInset={contentInset}
                svg={{ fill: '#AAA', fontSize: 10 }}
                numberOfTicks={5}
                formatLabel={(value: number) => `${Math.round(value/60)}h`}
              />
      
              {/* Chart container */}
              <View style={{ flex: 1, marginLeft: 8 }}>
                <AreaChart
                  style={{ flex: 1 }}
                  data={values}
                  svg={{ fill: svgProps.fill }}
                  curve={shape.curveMonotoneX}
                  contentInset={contentInset}
                >
                  <Grid />
                </AreaChart>
      
                <LineChart
                  style={StyleSheet.absoluteFill}
                  data={values}
                  svg={{ stroke: svgProps.stroke, strokeWidth: 2 }}
                  curve={shape.curveMonotoneX}
                  contentInset={contentInset}
                />
      
                <LineChart
                  style={StyleSheet.absoluteFill}
                  data={yBaseline}
                  svg={{ stroke: 'rgba(255,255,255,0.3)', strokeDasharray: [4,8], strokeWidth: 1 }}
                  curve={shape.curveMonotoneX}
                  contentInset={contentInset}
                />
              </View>
            </View>
      
            {/* X‐Axis */}
            <XAxis
              style={{ marginHorizontal: -8, height: 20 }}
              data={values}
              formatLabel={(_: any, index: number) => {
                // show Month/Day, e.g. "Aug/26"
                const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                const date = new Date();
                // walk back to the correct day in the 7-day window
                date.setDate(date.getDate() - (values.length - 1 - index));
                return `${monthNames[date.getMonth()]}-${date.getDate()}`;
              }}
              contentInset={{ left: 40, right: 16 }}
              svg={{ fill: '#AAA', fontSize: 10 }}
            />
          </View>
        )
      }

  if (type === 'gauge') {
        // TypeScript now knows `data` is { value: number; awakens: number }
        return (
        <View style={[styles.card, { alignItems: 'center', width: '100%' }]}>
            <Text testID={testID} style={styles.cardTitle}>{title}</Text>
            <GaugeChart
                size={160}
                segments={data.segments}
                />
                <View style={styles.legendContainer}>
                    {data.segments.map((seg, i) => {
                        // For a real app you'd derive a label + measurement from seg,
                        // here we'll just show "Segment #i" as a placeholder
                        const label = legendLabels[i] ?? `Segment ${i+1}`;     
                        const durationHrs = ((seg.to - seg.from) * 24).toFixed(1);
                        return (
                        <View key={i} style={styles.legendItem}>
                            <View style={[styles.swatch, { backgroundColor: seg.color }]} />
                            <Text style={styles.legendText}>
                            {label} ({durationHrs}h)
                            </Text>
                        </View>
                        );
                    })}
                    </View>
        </View>
        )
      }
    
      // If we get here, `type` is 'line' | 'bar', so `data` is number[]
      return (
        <View style={styles.card}>
          <Text testID={testID} style={styles.cardTitle}>{title}</Text>
          {type === 'line'
            ? (
              <LineChart
                style={styles.chart}
                data={data}
                svg={svgProps}
                curve={shape.curveMonotoneX}
                contentInset={{ top: 20, bottom: 20 }}
              >
                <Grid />
              </LineChart>
            )
            : (
              <BarChart
                style={styles.chart}
                data={data}
                svg={svgProps}
                contentInset={{ top: 20, bottom: 20 }}
              >
                <Grid />
              </BarChart>
            )
          }
        </View>
      )

};

const styles = StyleSheet.create({
  card: { margin: 16, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  absoluteFill: StyleSheet.absoluteFillObject,
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#FFF' },
  chart: { height: 180, width: '100%' },
  legendContainer: {
        flexDirection:   'row',
        flexWrap:        'wrap',
        justifyContent:  'center',
        marginTop:       8,
        paddingHorizontal: 12,
      },
      legendItem: {
        flexDirection: 'row',
        alignItems:    'center',
        margin:        4,
      },
      swatch: {
        width:   12,
        height:  12,
        borderRadius: 6,
        marginRight: 4,
      },
      legendText: {
        fontSize: 12,
        color:    '#FFF',
      },
})
