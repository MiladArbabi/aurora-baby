import React, { useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import type { LogSlice } from '../../models/LogSlice'
import { Picker } from '@react-native-picker/picker'
import { v4 as uuidv4 } from 'uuid'

interface Props {
  slices: LogSlice[]
  onSave: (updated: LogSlice[]) => void
  onCancel: () => void
}

const categories = ['sleep', 'awake', 'feed', 'care', 'diaper', 'talk', 'other'] as const
type Category = typeof categories[number]

// Generate time options every 30 minutes
const timeOptions = Array.from({ length: 48 }).map((_, i) => {
  const hours = Math.floor(i / 2)
  const mins = (i % 2) * 30
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
})

export default function ScheduleEditor({ slices, onSave, onCancel }: Props) {
  const [localSlices, setLocalSlices] = useState<LogSlice[]>(slices)

  const updateCategory = (id: string, cat: Category) => {
    setLocalSlices(prev =>
      prev.map(s => (s.id === id ? { ...s, category: cat } : s))
    )
  }

  function setSliceField(
    id: string,
    field: 'startTime' | 'endTime',
    iso: string
  ) {
    setLocalSlices(prev =>
      prev.map(s => {
        if (s.id !== id) return s
        const updated = { ...s, [field]: iso }

        // if user sets start past old end, bump end +30m
        if (field === 'startTime' && new Date(iso) >= new Date(s.endTime)) {
          const dt = new Date(iso)
          dt.setMinutes(dt.getMinutes() + 30)
          updated.endTime = dt.toISOString().replace('Z', '').replace(/\.\d+$/, '')
        }

        return updated
      })
    )
  }

  const handleAddSlice = () => {
    const date = localSlices[0]?.startTime.split('T')[0] ?? new Date().toISOString().split('T')[0]
    const nowIso = new Date().toISOString()
    const newSlice: LogSlice = {
      id: uuidv4(),
      babyId: localSlices[0]?.babyId || '',
      category: 'awake',
      startTime: `${date}T00:00:00.000`,
      endTime: `${date}T00:30:00.000`,
      createdAt: nowIso,
      updatedAt: nowIso,
      version: 1,
    }
    setLocalSlices(prev => [...prev, newSlice])
  }

  function handleClearAllLogs() {
    console.log('[ScheduleEditor] Clear All Logs pressed')
    setLocalSlices([])
  }
  
  function handleFillAllLogs() {
    console.log('[ScheduleEditor] Fill All Logs pressed')
    const date = new Date().toISOString().split('T')[0]
    const nowIso = new Date().toISOString()
    const filled: LogSlice[] = [
      {
        id: uuidv4(),
        babyId: localSlices[0]?.babyId || '',
        category: 'sleep',
        startTime: `${date}T10:00:00.000`,
        endTime: `${date}T11:30:00.000`,
        createdAt: nowIso,
        updatedAt: nowIso,
        version: 1,
      },
      {
        id: uuidv4(),
        babyId: localSlices[0]?.babyId || '',
        category: 'feed',
        startTime: `${date}T12:00:00.000`,
        endTime: `${date}T12:20:00.000`,
        createdAt: nowIso,
        updatedAt: nowIso,
        version: 1,
      },
    ]
    setLocalSlices(filled)
  }
  
  function handleShareLogs() {
    console.log('[ScheduleEditor] Share button pressed')
    // Implement export or navigation if needed
  }

  const renderItem = ({ item }: { item: LogSlice }) => {
    const [date, timePart] = item.startTime.split('T')
    const start = timePart.slice(0, 5)
    const end = item.endTime.split('T')[1].slice(0, 5)

    return (
      <View style={styles.row}>
        <Picker
          selectedValue={item.category}
          style={styles.picker}
          onValueChange={(cat: Category) => updateCategory(item.id, cat)}
        >
          {categories.map(c => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>

        <Picker
          selectedValue={start}
          style={styles.picker}
          onValueChange={time => {
            const iso = `${date}T${time}:00.000`
            setSliceField(item.id, 'startTime', iso)
          }}
        >
          {timeOptions.map(t => (
            <Picker.Item key={t} label={t} value={t} />
          ))}
        </Picker>

        <Picker
          selectedValue={end}
          style={styles.picker}
          onValueChange={time => {
            const iso = `${date}T${time}:00.000`
            setSliceField(item.id, 'endTime', iso)
          }}
        >
          {timeOptions.map(t => (
            <Picker.Item key={t} label={t} value={t} />
          ))}
        </Picker>

        <TouchableOpacity onPress={() => setLocalSlices(prev => prev.filter(s => s.id !== item.id))}>
          <Text style={styles.delete}>✕</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Schedule</Text>
      <FlatList
        data={localSlices}
        keyExtractor={s => s.id}
        renderItem={renderItem}
      />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddSlice}>
          <Text style={styles.addButtonText}>+ Add Slice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleFillAllLogs}>
          <Text>Fill All Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleClearAllLogs}>
          <Text>Clear All Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShareLogs}>
          <Text>Share</Text>
        </TouchableOpacity>

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
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  picker: { flex: 1, height: Platform.OS === 'ios' ? 150 : 50 },
  delete: { fontSize: 18, color: 'red', marginLeft: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginTop: 16 },
  button: { padding: 12, backgroundColor: '#eee', borderRadius: 4, margin: 4 },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
})