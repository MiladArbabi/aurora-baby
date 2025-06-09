// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from 'styled-components/native'
import { RootStackParamList } from '../../navigation/AppNavigator'

import CareLayout from '../../components/carescreen/CareLayout'
import MiniNavBar, { MiniTab } from '../../components/carescreen/MiniNavBar'
import { useTrackerSchedule } from 'hooks/useTrackerSchedule'
import { LogSlice } from '../../models/LogSlice'

import LogDetailModal from '../../components/carescreen/LogDetailModal'
import { getDailySchedule, saveDailySchedule } from '../../storage/ScheduleStorage'
import { setSliceConfirmed } from '../../services/LogSliceMetaService'
import { getLogSliceMeta } from '../../storage/LogSliceMetaStorage'
import { saveLogSliceMeta } from '../../storage/LogSliceMetaStorage'
import { LogSliceMeta } from '../../models/LogSliceMeta'
import type { DailySnapshot } from '../../models/DailySnapshot'
import { generateDailySnapshot } from '../../services/DailySnapshotService';
import DailySnapshotSummary from 'components/carescreen/DailySnapshotSummary'

import Tracker from '../../components/carescreen/Tracker'
import ScheduleEditor from '../../components/carescreen/ScheduleEditor'
import { getTodayISO } from '../../utils/date'
import { useSliceMeta } from 'hooks/useSliceMeta'
import { RING_THICKNESS, RING_SIZE, GAP, CLOCK_STROKE_WIDTH, CLOCK_STROKE_EXTRA, OUTER_RADIUS,
  WRAPPER_SIZE, CENTER, INNERMOST_DIAMETER, CLOCK_RADIUS
 } from 'utils/trackerConstants'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()
  const todayISO = getTodayISO() // Get today's date in 'YYYY-MM-DD' format 
  
  // and for generating AI‐suggested slices
  const [showLast24h, setShowLast24h] = useState(false)
  const babyId = 'defaultBabyId'
  const { slices, nowFrac, loading, error, refresh } = 
  useTrackerSchedule(babyId, showLast24h)
  const [selectedSlice, setSelectedSlice] = useState<LogSlice | null>(null)
  const [sliceMode, setSliceMode] = useState<'view'|'confirm'|'edit'>('edit')
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [snapshot, setSnapshot] = useState<DailySnapshot | null>(null)

  const { confirmedIds, unconfirmedIds, aiSuggestedIds, reloadMeta, suggestedTags } =
    useSliceMeta(slices, babyId)

  const [preview, setPreview] = useState<{
    hour: number
    slice: LogSlice
    expiresAt: number
  }|null>(null)

  // Bottom‐tab navigation handler
  const handleNavigate = useCallback((tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs')
    else if (tab === 'tracker') return // already here
    else if (tab === 'graph') navigation.navigate('Insights')
    else if (tab === 'future') navigation.navigate('InferredLogs')
  }, [navigation])

  //  ── 4) Slice‐tap handler ─────────────────────────────────────────
  const handleSlicePress = useCallback(
        async (hourIndex: number) => { 
        console.log('[CareScreen] handleSlicePress 🕑 hourIndex =', hourIndex)
          // 1) See if there’s already a LogSlice whose startTime hour == hourIndex
          const existing = slices.find(s => {
            const h = new Date(s.startTime).getHours()
            return h === hourIndex
          })
    
          if (existing) {
            const nowMs = Date.now()
                  const startMs = new Date(existing.startTime).getTime()
                  const meta = await getLogSliceMeta(babyId, existing.id)
            
                  if (startMs < nowMs) {
                    if (meta?.confirmed) {
                      setSliceMode('view')
                    } else {
                      setSliceMode('confirm')
                    }
                  } else {
                    setSliceMode('edit')
                  }
                  setSelectedSlice(existing)
            return
          }
    
          // 2) If no existing slice, create a “new” placeholder slice for that hour window
          const pad = (n: number) => n.toString().padStart(2, '0')
          const startIso = `${todayISO}T${pad(hourIndex)}:00:00.000`
          const endIso   = `${todayISO}T${pad(hourIndex + 1 <= 23 ? hourIndex + 1 : 23)}:00:00.000`
          // createdAt/updatedAt can remain UTC‐ISO if you prefer, but slice times must be local
          const nowIso   = new Date().toISOString()
          const newSlice: LogSlice = {
            id: `new-${todayISO}-${hourIndex}`,         // a temporary ID
            babyId: babyId,                             // replace with actual babyId
            category: 'other',                          // default until user edits
            startTime: startIso,
            endTime: endIso,
            createdAt: nowIso,
            updatedAt: nowIso,
            version: 1,                                 // initial version
          }
          setSelectedSlice(newSlice)
        },
        [slices]
      )

      function showTimePreview(hour: number) {
            const slice = slices.find(s => new Date(s.startTime).getHours() === hour)
            if (!slice) return
            setPreview({ hour, slice, expiresAt: Date.now() + 1500 })
          }

      const handleSave = async (updated: LogSlice) => {
                      // ── A) Update today's schedule array ───────────────────────────────
                      const schedule = (await getDailySchedule(todayISO, babyId)) || []
                      // If a slice with the same ID exists, replace it; otherwise append.
                      const foundIdx = schedule.findIndex(s => s.id === updated.id)
                      let newSchedule: LogSlice[]
                      if (foundIdx >= 0) {
                        newSchedule = [
                          ...schedule.slice(0, foundIdx),
                          updated,
                          ...schedule.slice(foundIdx + 1),
                        ]
                      } else {
                        newSchedule = [...schedule, updated]
                      }
                      await saveDailySchedule(todayISO, babyId, newSchedule)
                  
                      // ── B) Mark this slice as “edited” in metadata ─────────────────────
                      const nowISO = new Date().toISOString()
                      const sliceMeta: LogSliceMeta = {
                        id: updated.id,
                        source: 'user',
                        confirmed: false,
                        edited: true,
                        lastModified: nowISO,
                        overlap: false,
                        incomplete: false,
                      }
                      await saveLogSliceMeta(babyId, sliceMeta)
                  
                      // Close the modal and refresh the view
                      setSelectedSlice(null)
                      refresh()
                    }

        const handleConfirmAll = useCallback(async () => {
              await Promise.all(
                unconfirmedIds.map(id => setSliceConfirmed(babyId, id, true))
              )
              // Refresh metadata after bulk confirm
              reloadMeta()
            }, [babyId, unconfirmedIds, reloadMeta])

        
        useEffect(() => {
          if (!loading && !error) {
            generateDailySnapshot(babyId, todayISO)
              .then(setSnapshot)
              .catch(console.warn)
            }
        }, [loading, error, babyId, todayISO])    

    // Show loading or error
    if (loading) {
      return (
        <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </CareLayout>
      )
    }
    if (error) {
      return (
        <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
          <Text style={{ color: theme.colors.error, textAlign: 'center', marginTop: 20 }}>
            {error.message}
          </Text>
          <TouchableOpacity onPress={refresh} style={{ marginTop: 10 }}>
            <Text style={{ color: theme.colors.primary }}>Retry</Text>
          </TouchableOpacity>
        </CareLayout>
      )
    }
    
  return (
    <>
    <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      {/* ── 0. CONFIRM‐ALL BANNER ────────────────────────────────────────── */}
{/*      {unconfirmedIds.length > 0 && (
       <View style={styles.confirmBanner}>
         <Text style={styles.confirmText}>
           You have {unconfirmedIds.length} past slice
           {unconfirmedIds.length > 1 ? 's' : ''} to confirm.
         </Text>
         <TouchableOpacity onPress={handleConfirmAll} style={styles.confirmButton}>
           <Text style={styles.confirmButtonText}>Confirm All</Text>
         </TouchableOpacity>
       </View>
     )} */}

      {/* ── TRACKER ───────────────────────────────────────────── */}
     <Tracker
        slices={slices}
        nowFrac={nowFrac}
        onSlicePress={showTimePreview}        // single tap → preview
        onSliceLongPress={handleSlicePress}
        confirmedIds={confirmedIds}
        aiSuggestedIds={aiSuggestedIds}
        onResize={() => {
          // This is a no-op, but you can implement resizing logic if needed
        }}
        isEditingSchedule={isEditingSchedule}
      />

      {/* ── Edit Schedule ─────────────────────────────────────────── */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => setIsEditingSchedule(true)} style={styles.iconWrapper}>
          <Text style={styles.confirmButtonText}>Edit Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* ── DAILY SUMMARY ───────────────────────────────────────────── */}
{/*       {snapshot && <DailySnapshotSummary snapshot={snapshot} />}
 */}
      {/* ToolTip for Time Preview */ }
      {preview && Date.now() < preview.expiresAt && (() => {
        // midpoint math:
        const { slice, hour } = preview
        const totalM = new Date(slice.startTime).getHours()*60 + new Date(slice.startTime).getMinutes()
        const midAngle = ((totalM/(24*60))*2*Math.PI) - Math.PI/2
        const r = (RING_SIZE/2 + CLOCK_STROKE_EXTRA)
        const x = CENTER + r*Math.cos(midAngle)
        const y = CENTER + r*Math.sin(midAngle)
        const start = slice.startTime.slice(11,16)
        const end   = slice.endTime.slice(11,16)
        return (
          <View style={{
            position: 'absolute',
            left: x - 40,
            top: y - 20,
            backgroundColor: 'rgba(0,0,0,0.7)',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 4,
          }}>
            <Text style={{ color: 'white', fontSize: 11 }}>{start} – {end}</Text>
          </View>
        )
      })()}
    </CareLayout>

    {isEditingSchedule && (
      <Modal animationType="slide" transparent>
        <ScheduleEditor
          slices={slices}
          onSave={async updated => {
            // persist whole‐day schedule
            await saveDailySchedule(todayISO, babyId, updated)
            setIsEditingSchedule(false)
            refresh()
          }}
          onCancel={() => setIsEditingSchedule(false)}
        />
      </Modal>
    )} 

    {selectedSlice && (
      <LogDetailModal
        visible
        slice={selectedSlice}
        mode={sliceMode}
        onClose={() => setSelectedSlice(null)}
        onSave={handleSave}
        onConfirm={async id => {
          await setSliceConfirmed(babyId, id, true)
          setSelectedSlice(null)
          refresh()
          reloadMeta()
        }}
        onDelete={async id => {
          if (!id.startsWith('new-')) {
            const sched = await getDailySchedule(todayISO, babyId)
            if (sched) {
              await saveDailySchedule(
                todayISO,
                babyId,
                sched.filter(s => s.id !== id)
              )
              refresh()
              reloadMeta()
            }
          }
          setSelectedSlice(null)
        }}

        suggestedTags={suggestedTags[selectedSlice.id] ?? []}
        onAddTag={async (tag: string) => {
          // load or initialize metadata
          const now = new Date().toISOString()
          const existing =
            (await getLogSliceMeta(babyId, selectedSlice.id)) ?? {
              id: selectedSlice.id,
              source: 'user',
              confirmed: false,
              edited: false,
              lastModified: now,
              overlap: false,
              incomplete: false,
              tags: [] as string[],
            }
          // add without dupes
          const newTags = Array.from(new Set([...(existing.tags || []), tag]))
          // persist
          await saveLogSliceMeta(babyId, {
            ...existing,
            tags: newTags,
            lastModified: now,
          })
          await reloadMeta()
        }}
      />
    )}
  </>
  ) 
}

export default CareScreen

const styles = StyleSheet.create({
  screen: { flex: 1 },
  summaryCard: {
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 12,
      },
      summaryTitle: {
        fontWeight: '600',
        marginBottom: 8,
      },
      summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
      },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 32,
  },
  iconWrapper: {
    marginHorizontal: 12,
  },
  tickSvg: {
       position: 'absolute',
        top: 0,
        left: 0,
      },
  // Tracker section (flex:4)
  trackerContainer: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringWrapper: {
    width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
  },
  arcAbsolute: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Time‐of‐day labels (positioned inside trackerContainer)
  labelsWrapper: {
    position: 'absolute',
    width: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    height: RING_SIZE + CLOCK_STROKE_EXTRA * 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeLabel: {
    position: 'absolute',
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    width: 32,
    textAlign: 'center',
  },

  // Filter section (flex:1)
  filterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── CONFIRM‐ALL BANNER STYLES ──────────────────────────────────────
  confirmBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  confirmText: {
    color: '#856404',
    fontFamily: 'Inter',
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: '#856404',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  confirmButtonText: {
    color: '#000000',
    fontFamily: 'Inter',
    fontSize: 14,
  },
})
