// src/screens/InsightsView.tsx
import React from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { LineChart, BarChart, Grid } from 'react-native-svg-charts'
import { useInsightsData } from '../hooks/useInsightsData'

const { width } = Dimensions.get('window')

const InsightsView: React.FC<{ showLast24h: boolean }> = ({ showLast24h }) => {
  const { byDate } = useInsightsData(showLast24h)

  const dates   = byDate.map(d => d.date.substr(5)) // MM-DD
  const sleep   = byDate.map(d => d.sleep)
  const feeding = byDate.map(d => d.feeding)
  const diaper  = byDate.map(d => d.diaper)

  return (
    <ScrollView style={styles.container}>
      {/* Sleep duration line */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sleep (min)</Text>
        <LineChart
          style={styles.chart}
          data={sleep}
          svg={{ stroke: '#4A90E2' }}
          contentInset={{ top: 20, bottom: 20 }}
        >
          <Grid />
        </LineChart>
        <View style={styles.axisRow}>
          {dates.map((d, i) => (
            <Text key={i} style={styles.axisLabel}>{d}</Text>
          ))}
        </View>
      </View>

      {/* Feeding count bar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Feedings</Text>
        <BarChart
          style={styles.chart}
          data={feeding}
          svg={{ fill: '#50E3C2' }}
          contentInset={{ top: 20, bottom: 20 }}
        >
          <Grid />
        </BarChart>
        <View style={styles.axisRow}>
          {dates.map((d, i) => (
            <Text key={i} style={styles.axisLabel}>{d}</Text>
          ))}
        </View>
      </View>

      {/* Diapers count bar */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Diaper changes</Text>
        <BarChart
          style={styles.chart}
          data={diaper}
          svg={{ fill: '#F5A623' }}
          contentInset={{ top: 20, bottom: 20 }}
        >
          <Grid />
        </BarChart>
        <View style={styles.axisRow}>
          {dates.map((d, i) => (
            <Text key={i} style={styles.axisLabel}>{d}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

export default InsightsView

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  card: {
    margin: 16,
    padding: 12,
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  chart:    { height: 180, width: width - 64 },
  axisRow:  { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { fontSize: 10, color: '#666' },
})
