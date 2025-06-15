import React, { useState, useMemo } from 'react'
import { useTheme } from 'styled-components/native'
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import type { LogSlice } from '../../models/LogSlice'
import { v4 as uuidv4 } from 'uuid'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../../navigation/AppNavigator'

import DiaperIcon from '../../assets/carescreen/QuickLogMenu/DiaperButton'
import TopNav from 'components/common/TopNav'
import { listTemplates, getTemplate } from '../../storage/TemplateStorage'
import { getTodayISO } from '../../utils/date'
import { BabyProfile } from 'models/BabyProfile'
import { DefaultDailyEntries } from '../../data/defaultSchedule'


// Props include slices, onSave, onCancel, unconfirmedIds, handleConfirmAll, onEditSlice
interface Props {
  slices: LogSlice[]
  onSave: (updated: LogSlice[]) => void
  onCancel: () => void
  unconfirmedIds: string[]
  handleConfirmAll: () => void
  onEditSlice: (slice: LogSlice) => void
}

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

export default function ScheduleEditor({
  slices,
  onSave,
  onCancel,
  unconfirmedIds,
  handleConfirmAll,
  onEditSlice,
}: Props) {
  const theme = useTheme()
  const navigation = useNavigation<CareNavProp>()

  const [localSlices, setLocalSlices] = useState<LogSlice[]>(slices)
  const today = getTodayISO()
  const babyId = slices[0]?.babyId ?? ''

  // Sort slices by start time
  const sorted = useMemo(
    () => [...localSlices].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    ),
    [localSlices]
  )

  function handleAddSlice() {
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
      isAiSuggested: false,
    }
    setLocalSlices(prev => [...prev, newSlice])
    onEditSlice(newSlice)
  }

  function handleRemove(id: string) {
    setLocalSlices(prev => prev.filter(s => s.id !== id))
  }

  function handleExport() {
    console.log('[ScheduleEditor] Export pressed')
  }

  // The Refill Handler
  async function handleRefill() {
    const templates = await listTemplates(babyId)
    if (templates.length === 0) {
      return Alert.alert(
        'Build Routine',
        'No saved routines found. Shall I scaffold a basic day for you?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, please',
            onPress: () => {
              const [Y, M, D] = today.split('-').map(n => +n)
              const nowTs = new Date().toISOString()
              const newSlices: LogSlice[] = DefaultDailyEntries.map(entry => {
                const start = new Date(Y, M - 1, D, entry.startHour)
                const end   = new Date(Y, M - 1, D, entry.endHour)
                return {
                  id: uuidv4(),
                  babyId,
                  category: entry.category,
                  startTime: start.toISOString(),
                  endTime:   end.toISOString(),
                  createdAt: nowTs,
                  updatedAt: nowTs,
                  version: 1,
                  isAiSuggested: false,
                }
              })
  
              // lift it up for persistence & rerender
              onSave(newSlices)
              setLocalSlices(newSlices)
            }
          }
        ],
        { cancelable: true }
      )
    }
  
    // … your existing “select a saved template” flow …
  }  
    

  return (
    <View style={styles.container}>
      <TopNav navigation={navigation} />
      <FlatList
        data={sorted}
        keyExtractor={s => s.id}
        getItemLayout={(_, i) => ({ length: 50, offset: 50 * i, index: i })}
        renderItem={({ item: slice }) => {
          const isConfirmed = !unconfirmedIds.includes(slice.id)
          const borderColor = isConfirmed ? '#4CAF50' : '#E53935'
          const bgColor = `${borderColor}33`
          const [ , timePart ] = slice.startTime.split('T')
          const start = timePart.slice(0,5)
          const end   = slice.endTime.split('T')[1].slice(0,5)
          const Icon = DiaperIcon

          return (
            <View style={[styles.row, { borderColor, backgroundColor: bgColor }]}> 
              <TouchableOpacity
                style={styles.left}
                onPress={() => onEditSlice(slice)}
              >
                <Icon color={theme.colors.primary} style={styles.leftIcon} />
                <View>
                  <Text style={styles.category}>{slice.category}</Text>
                  <Text style={styles.times}>{start} – {end}</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.remove}
                onPress={() => handleRemove(slice.id)}
              >
                <Text style={styles.delete}>✕</Text>
              </TouchableOpacity>
            </View>
          )
        }}
        contentContainerStyle={{ paddingBottom: 180 }}
      />

      {/* Confirm-all banner */}
      {unconfirmedIds.length > 0 && (
        <View style={styles.confirmBanner}>
          <Text style={styles.confirmText}>
            You have {unconfirmedIds.length} past slice{unconfirmedIds.length > 1 ? 's' : ''} to confirm.
          </Text>
          <TouchableOpacity onPress={handleConfirmAll} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.rowButtons}>
         <TouchableOpacity style={styles.smallButton} onPress={handleRefill}>
            <Text style={styles.smallButtonText}>Refill Schedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={handleAddSlice}>
            <Text style={styles.smallButtonText}>+ Add Slice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallButton} onPress={handleExport}>
            <Text style={styles.smallButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowButtons}>
          <TouchableOpacity
            style={[styles.smallButton, styles.expand]}
            onPress={() => onSave(localSlices)}
          >
            <Text style={styles.smallButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallButton, styles.expand]}
            onPress={onCancel}
          >
            <Text style={styles.smallButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 16,
    marginVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  leftIcon: { marginRight: 8 },
  category: { fontSize: 16, fontWeight: '500' },
  times: { fontSize: 14, color: '#666', marginTop: 2 },
  remove: { width: 30, alignItems: 'flex-end' },
  delete: { fontSize: 18, color: 'red' },
  confirmBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
    borderWidth: 1,
    padding: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmText: { color: '#856404', fontSize: 14 },
  confirmButton: {
    backgroundColor: '#856404',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  confirmButtonText: { color: '#fff', fontSize: 14 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
    backgroundColor: '#fff',
  },
  rowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  smallButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 6,
    alignItems: 'center',
  },
  smallButtonText: { color: '#fff', fontWeight: '600' },
  expand: { flex: 1 },
})
