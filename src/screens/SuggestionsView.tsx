// src/components/carescreen/SuggestionsView.tsx
import React from 'react'
import { View, Text, FlatList, StyleSheet } from 'react-native'

const MOCK_SUGGESTIONS = [
  { id: '1', text: 'Try nap around 2 PM tomorrow' },
  { id: '2', text: 'Offer feeding every 3 hours today' },
]

export default function SuggestionsView() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>AI Suggestions</Text>
      <FlatList
        data={MOCK_SUGGESTIONS}
        keyExtractor={s => s.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No suggestions yet.</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header:    { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row:       { paddingVertical: 8, borderBottomWidth: 1, borderColor: '#eee' },
})
