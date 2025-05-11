//src/components/carescreen/ChartCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  LineChart, BarChart, Grid, AreaChart, StackedBarChart, PieChart, XAxis, YAxis 
    } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { format, subDays, subWeeks, subMonths } from 'date-fns';
import { useTheme } from 'styled-components/native';
import GaugeChart from './GaugeChart';
import { TimelineChart, Interval } from './TimelineChart'

export type LineBarSpec = {
  type: 'line' | 'bar';
  data: number[];
  svgProps: any;
  testID: string;
  title: string;
};

export type AreaSpec = {
  type: 'area';
  testID: string;
  title: string;
  data: number[];
  period?: 'Daily' | 'Weekly' | 'Monthly';
  svgProps: {
    stroke: string;
    fill: string;
    baseline: number;
  };
};

export type Segment = {
  from: number;
  to: number;
  color: string;
};

export type GaugeSpec = {
  type: 'gauge';
  testID: string;
  title: string;
  data: { segments: Segment[] };
  svgProps?: any;
};

export type StatStripSpec = {
  type: 'statStrip'
  testID: string
  title: string
  data: { avgDaily: number; avgWeekly: number; avgMonthly: number }
}

export type DonutSpec = {
  type: 'donut'
  testID: string
  title: string
  data: Record<string, number>
  colors: string[]
}

export type MarkerTimelineSpec = {
  type: 'markerTimeline'
  testID: string
  title: string
  intervals: Interval[]
  markers: { fraction: number; color: string; label: string }[]
  period: 'Daily' | 'Weekly' | 'Monthly'
}

export type CalloutSpec = {
  type: 'callout'
  testID: string
  title: string
  data: string
}

export type ChartSpec = 
    LineBarSpec 
    | GaugeSpec 
    | AreaSpec 
    | StatStripSpec
    | DonutSpec
    | MarkerTimelineSpec
    | CalloutSpec
    | StackedBarSpec
    | { type: 'timeline'; testID: string; title: string; data: Interval[]; 
      period: 'Daily' | 'Weekly' | 'Monthly' };

export type StackedBarSpec = {
  type: 'stackedBar';
  testID: string;
  title: string;
  data: Array<Record<string, number>>;
  keys: string[];
  colors: string[];
  period: 'Daily' | 'Weekly' | 'Monthly';
};

export const ChartCard: React.FC<ChartSpec> = props => {
  const theme = useTheme();
  const { testID, title, type } = props;
  const legendLabels = [
    'Night Sleep',
    'Morning Wake',
    'Nap 1',
    'Nap 2',
    'Nap 3',
    'Wake Inbetween Naps',
  ];

  // ── 1) stat-strip (averages) ─────────────────────────────────────────
  if (type === 'statStrip') {
      const { avgDaily, avgWeekly, avgMonthly } = (props as StatStripSpec).data;
      return (
        <View style={styles.card}>
          <Text testID={testID} style={styles.cardTitle}>{title}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            {(
              [
                ['day',   avgDaily  ],
                ['week',  avgWeekly ],
                ['month', avgMonthly]
              ] as readonly [string, number][]
          ).map(([lbl, val]) => (
            <View key={lbl} style={styles.statCard}>
              <Text style={styles.statValue}>{val.toFixed(1)}</Text>
              <Text style={styles.statLabel}>{`/ ${lbl}`}</Text>
            </View>
          ))}
        </View>
      </View>
      );
    }
  
    // ── 2) donut (feed type breakdown) ────────────────────────────────────
    if (type === 'donut') {
      const { data, colors } = props as DonutSpec;
      const pieData = Object.entries(data).map(([key, value], i) => ({
        key,
        value,
        svg: { fill: colors[i % colors.length] },
      }));
      return (
        <View style={styles.card}>
          <Text testID={testID} style={styles.cardTitle}>{title}</Text>
          <PieChart style={{ height: 180 }} data={pieData} />
        </View>
      );
    }
  
    // ── 3) marker-timeline (feed vs sleep) ────────────────────────────────
    if (type === 'markerTimeline') {
      const { intervals, markers, period } = props as MarkerTimelineSpec;
      return (
        <View style={styles.card}>
          <Text testID={testID} style={styles.cardTitle}>{title}</Text>
          <TimelineChart
            intervals={intervals}
            markers={markers}
            period={period}
          />
        </View>
      );
    }
  
    // ── 4) plain text callout ─────────────────────────────────────────────
    if (type === 'callout') {
      return (
        <View style={styles.card}>
          <Text testID={testID} style={[styles.cardTitle, styles.calloutText]}>
            {(props as CalloutSpec).data}
          </Text>
        </View>
      );
    }

  if (props.type === 'stackedBar') {
    const { data, keys, colors, testID, title, period } 
    = props as StackedBarSpec & 
    { period: 'Daily'|'Weekly'|'Monthly' };

     // compute the total for each stack to drive the Y axis:
      const totals = data.map(row =>
        keys.reduce((sum, k) => sum + (row[k] || 0), 0)
      );

      // generate labels based on your incoming `period` prop
      const labels = data.map((_, i) => {
        switch ((props as any).period) {
          case 'Daily':   return `Day ${i+1}`;
          case 'Weekly':  return `Wk ${i+1}`;
          case 'Monthly': return `Mth ${i+1}`;
          default:        return `${i+1}`;
        }
      });

    return (
    <View style={styles.card}>
      <Text testID={testID} style={styles.cardTitle}>{title}</Text>
      <View style={{ flexDirection: 'row', height: 180, paddingHorizontal: 8 }}>
        {/* ─── Y‐Axis on the left ────────────────── */}
        <YAxis
          data={[0, 24]}
          min={0}
          max={24}
          numberOfTicks={7}          
          /* only top padding, so the 0‐line is flush */
          contentInset={{ top: 20, bottom: 20 }}
          svg={{ fill: '#AAA', fontSize: 10 }}
          formatLabel={(v: number) => `${v}h`}
        />
        <View style={{ flex: 1, marginLeft: 8 }}>
          {/* ─── The stacked bars ─────────────────── */}
          <StackedBarChart
            style={{ flex: 1 }}
            keys={keys}
            colors={colors}
            data={data}
            contentInset={{ top: 20, bottom: 0 }}
          />
          {/* ─── X‐Axis across the bottom ──────────── */}
          <XAxis
            style={{ marginTop: 4 }}
            data={data}
            formatLabel={(_: any, idx: number) => labels[idx]}
            contentInset={{ left:20, right:20 }}
            svg={{ fill:'#AAA', fontSize:10 }}
          />
        </View>
      </View>
    </View>
  );
}

  if (type === 'timeline') {
    const { data: intervals, period } = props as { 
        data: Interval[]; period: 'Daily'|'Weekly'|'Monthly' };
        return (
          <View style={styles.card}>
            <Text testID={testID} style={styles.cardTitle}>{title}</Text>
            <TimelineChart intervals={intervals} period={period} />
          </View>
        );
      }

  if (type === 'area') {
    // props is narrowed to AreaSpec
    const { data: values, period, svgProps } = props as AreaSpec;
    const yBaseline = values.map(() => svgProps.baseline);
    const contentInset = { top: 20, bottom: 20 };
    const today = new Date();

    const labels = values.map((_, i) => {
      switch (period) {
        case 'Daily':
          return format(subDays(today, values.length - 1 - i), 'EEE');
        case 'Weekly': {
          const weekDate = subWeeks(today, values.length - 1 - i);
          return `W${format(weekDate, 'w')}`;
        }
        case 'Monthly':
          return format(subMonths(today, values.length - 1 - i), 'MMM');
        default:
          return format(subDays(today, values.length - 1 - i), 'EEE');
      }
    });

    return (
      <View style={styles.card}>
        <Text testID={testID} style={styles.cardTitle}>{title}</Text>
        <View style={{ flexDirection: 'row', height: 200, paddingHorizontal: 8 }}>
          <YAxis
            data={values}
            contentInset={contentInset}
            svg={{ fill: '#AAA', fontSize: 10 }}
            numberOfTicks={5}
            formatLabel={(value: number) => `${Math.round(value/60)}h`}
          />
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
        <XAxis
          style={{ marginHorizontal: -8, height: 20 }}
          data={values}
          formatLabel={(_: any, index: number) => labels[index]}
          contentInset={{ left: 40, right: 16 }}
          svg={{ fill: '#AAA', fontSize: 10 }}
        />
      </View>
    );
  }

  if (type === 'gauge') {
    // props is narrowed to GaugeSpec
    const { data: { segments } } = props as GaugeSpec;
    return (
      <View style={[styles.card, { alignItems: 'center', width: '100%' }]}>
        <Text testID={testID} style={styles.cardTitle}>{title}</Text>
        <GaugeChart size={160} segments={segments} />
        <View style={styles.legendContainer}>
          {segments.map((seg, i) => {
            const label = legendLabels[i] ?? `Segment ${i+1}`;
            const durationHrs = ((seg.to - seg.from) * 24).toFixed(1);
            return (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.swatch, { backgroundColor: seg.color }]} />
                <Text style={styles.legendText}>{label} ({durationHrs}h)</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  // line or bar chart:
  const { data: values, svgProps: chartSvg } = props as LineBarSpec;
  return (
    <View style={styles.card}>
      <Text testID={testID} style={styles.cardTitle}>{title}</Text>
      {type === 'line'
        ? <LineChart style={styles.chart} data={values} svg={chartSvg} curve={shape.curveMonotoneX} contentInset={{ top: 20, bottom: 20 }}><Grid/></LineChart>
        : <BarChart style={styles.chart} data={values} svg={chartSvg} contentInset={{ top: 20, bottom: 20 }}><Grid/></BarChart>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  card: { margin: 16, padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  absoluteFill: StyleSheet.absoluteFillObject,
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#FFF' },
  chart: { height: 180, width: '100%' },
  legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 8, paddingHorizontal: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', margin: 4 },
  swatch: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  legendText: { fontSize: 12, color: '#FFF' },
  calloutText: { fontSize: 16, fontWeight: '600', color: '#FFF', textAlign: 'center' },
  statCard: { flex: 1, alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.05)' },
  statValue: { fontSize: 24, fontWeight: '600', color: '#FFF' },
  statLabel: { fontSize: 12, color: '#FFF' },
  statStrip: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statStripLabel: { fontSize: 12, color: '#FFF' },
  statStripValue: { fontSize: 24, fontWeight: '600', color: '#FFF' },
  statStripUnit: { fontSize: 12, color: '#FFF' },
  statStripContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statStripValueContainer: { flexDirection: 'row', alignItems: 'center' },
  statStripUnitContainer: { marginLeft: 4 },
  statStripLabelContainer: { marginRight: 4 },
});