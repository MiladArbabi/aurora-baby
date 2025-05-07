import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart, BarChart, Grid } from 'react-native-svg-charts';
import { useTheme } from 'styled-components/native';
import GaugeChart from './GaugeChart';

export type LineBarSpec = {
    type: 'line' | 'bar';
    data: number[];
    svgProps: any;
    testID: string;
    title: string;
  };
  
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

  export type ChartSpec = LineBarSpec | GaugeSpec;
  
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
