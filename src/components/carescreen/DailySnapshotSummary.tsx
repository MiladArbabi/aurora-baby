// src/components/DailySnapshotSummary.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from 'styled-components/native'
import type { DailySnapshot } from '../../models/DailySnapshot'

interface Props {
  snapshot: DailySnapshot
}

export default function DailySnapshotSummary({ snapshot }: Props) {
  const theme = useTheme()

  return (
    <View 
    testID="daily-snapshot-card"
    style={[styles.card, { backgroundColor: theme.colors.background 
    }]}>
        
      <Text style={styles.title}>Today’s Summary</Text>

      <View style={styles.row}>
        <Text>Sleep</Text>
        <Text>{snapshot.totalDurations.sleep} min</Text>
      </View>
      <View style={styles.row}>
        <Text>Awake</Text>
        <Text>{snapshot.totalDurations.awake} min</Text>
      </View>
      <View style={styles.row}>
        <Text>Feeds</Text>
        <Text>{snapshot.counts.feed}× ({snapshot.totalDurations.feed} min)</Text>
      </View>
      <View style={styles.row}>
        <Text>Diapers</Text>
        <Text>{snapshot.counts.diaper}×</Text>
      </View>
      {/* add more rows here as needed */}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
})
