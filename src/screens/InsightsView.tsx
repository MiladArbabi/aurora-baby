//src/screens/InsightsView.tsx (graphs)
import React, { useState } from 'react'
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../navigation/AppNavigator'
import CareLayout from 'components/carescreen/CareLayout'
import MiniNavBar, { MiniTab } from 'components/carescreen/MiniNavBar'

import { LineChart, BarChart, Grid } from 'react-native-svg-charts'
import { useInsightsData } from '../hooks/useInsightsData'

const { width } = Dimensions.get('window')

type InsightsNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const InsightsScreen: React.FC = () => {
  const navigation = useNavigation<InsightsNavProp>()
  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'graph') return
    if (tab === 'tracker') navigation.navigate('Care')
    if (tab === 'cards')   navigation.navigate('PastLogs')
  }
  const theme = useTheme()
  const [showLast24h, setShowLast24h] = useState(false)
  const { byDate } = useInsightsData(showLast24h)

  const dates = byDate.map(d => d.date.slice(5))
  const sleep = byDate.map(d => d.sleep)
  const feeding = byDate.map(d => d.feeding)
  const diaper = byDate.map(d => d.diaper)

  const handleToggle = () => setShowLast24h(v => !v)

  return (
    <CareLayout 
        activeTab="tracker" 
        onNavigate={handleNavigate}
        bgColor={theme.colors.darkBackground}
        >      
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sleep (min)</Text>
          <LineChart
            style={styles.chart}
            data={sleep}
            svg={{ stroke: theme.colors.primary }}
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Feedings</Text>
          <BarChart
            style={styles.chart}
            data={feeding}
            svg={{ fill: theme.colors.secondaryBackground }}
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diaper changes</Text>
          <BarChart
            style={styles.chart}
            data={diaper}
            svg={{ fill: theme.colors.accent }}
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
    </CareLayout>
  )
}

export default InsightsScreen

const styles = StyleSheet.create({
  screen: { flex: 1 },
  filterContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { paddingBottom: 16 },
  card: { margin: 16, padding: 12, backgroundColor: '#F7F7F7', borderRadius: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  chart: { height: 180, width: width - 64 },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisLabel: { fontSize: 10, color: '#666' },
})