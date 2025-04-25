// src/components/carescreen/PastLogsView.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { getLogsBetween } from '../services/QuickLogAccess'

export default function PastLogsView() {
  const [entries, setEntries] = useState<QuickLogEntry[]>([])

  useEffect(() => {
    // For demo, load all logs for the last week:
    const end = new Date().toISOString()
    const start = new Date(Date.now() - 7*24*60*60*1000).toISOString()
    getLogsBetween(start, end).then(setEntries).catch(console.error)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Past Logs</Text>
      <FlatList
        data={entries}
        keyExtractor={e => e.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.type}>{item.type}</Text>
            <Text>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No logs yet.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header:    { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row:       { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  type:      { fontWeight: '500' },
})
