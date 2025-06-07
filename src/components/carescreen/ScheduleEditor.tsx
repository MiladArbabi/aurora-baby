import React, { useState } from 'react'
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native'
import type { LogSlice } from '../../models/LogSlice'

interface Props {
  slices: LogSlice[]
  onSave: (updated: LogSlice[]) => void
  onCancel: () => void
}

export default function ScheduleEditor({ slices, onSave, onCancel }: Props) {
  const [localSlices, setLocalSlices] = useState<LogSlice[]>(slices)

  // Handler to update a slice field
  const updateSlice = (id: string, field: keyof LogSlice, value: string) => {
    setLocalSlices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const renderItem = ({ item }: { item: LogSlice }) => (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        value={item.category}
        onChangeText={text => updateSlice(item.id, 'category', text)}
        placeholder="Category"
      />
      <TextInput
        style={styles.input}
        value={new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        onChangeText={time => updateSlice(item.id, 'startTime', `${item.startTime.split('T')[0]}T${time}:00.000Z`)}
        placeholder="Start"
      />
      <TextInput
        style={styles.input}
        value={new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        onChangeText={time => updateSlice(item.id, 'endTime', `${item.endTime.split('T')[0]}T${time}:00.000Z`)}
        placeholder="End"
      />
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Schedule</Text>
      <FlatList
        data={localSlices}
        keyExtractor={s => s.id}
        renderItem={renderItem}
      />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.button} onPress={() => onSave(localSlices)}>
          <Text>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, marginHorizontal: 4, borderRadius: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
  button: { padding: 12, backgroundColor: '#eee', borderRadius: 4 }
})
