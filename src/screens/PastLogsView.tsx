// src/components/carescreen/PastLogsView.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, FlatList, StyleSheet, Button } from 'react-native'
import { QuickLogEntry } from '../models/QuickLogSchema'
import { getLogsBetween } from '../services/QuickLogAccess'
import { generateAIQuickLogs } from '../services/LlamaLogGenerator';


export default function PastLogsView() {
  const [entries, setEntries] = useState<QuickLogEntry[]>([])
  const [aiEntries, setAiEntries] = useState<QuickLogEntry[]>([])
  const [loadingAI, setLoadingAI] = useState(false)

  // calculate last-week window once
  const [start, end] = React.useMemo(() => {
    const end = new Date().toISOString()
    const start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    return [start, end] as const
  }, [])

  // load real logs
  useEffect(() => {
    getLogsBetween(start, end)
      .then(setEntries)
      .catch(console.error)
  }, [start, end])

  // load AI logs
  const fetchAISuggestions = useCallback(async () => {
    setLoadingAI(true)
    try {
      // pass in the real entries array, and how many hours ahead you want
      const suggestions = await generateAIQuickLogs(entries, 24)      
      setAiEntries(suggestions)
    } catch (err) {
      console.error('[PastLogsView] AI fetch failed:', err)
    } finally {
      setLoadingAI(false)
    }
  }, [start, end, entries])

  const renderEntry = ({ item }: { item: QuickLogEntry }) => (
    <View style={styles.row}>
      <Text style={styles.type}>{item.type}</Text>
      <Text>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Past Logs</Text>
      <FlatList
        data={entries}
        keyExtractor={e => `real-${e.id}`}
        renderItem={renderEntry}
        ListEmptyComponent={<Text>No logs yet.</Text>}
      />

      <View style={styles.divider}/>
      <Button
        title={loadingAI ? 'Generating...' : 'Generate AI-Suggested Logs'}
        onPress={fetchAISuggestions}
        disabled={loadingAI}
      />

      {aiEntries.length > 0 && (
        <>
          <Text style={[styles.header, { marginTop: 16 }]}>
            AI-Suggested Future Logs
          </Text>
          <FlatList
            data={aiEntries}
            keyExtractor={e => `ai-${e.id}`}
            renderItem={renderEntry}
          />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header:    { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row:       { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
  type:      { fontWeight: '500' },
  divider:   { height: 1, backgroundColor: '#ccc', marginVertical: 16 },
})
