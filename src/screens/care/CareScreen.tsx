// src/screens/CareScreen.tsx
import React, { useCallback, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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

import Tracker from '../../components/carescreen/Tracker'
import ScheduleEditor from '../../components/carescreen/ScheduleEditor'
import { getTodayISO } from '../../utils/date'
import { useSliceMeta } from 'hooks/useSliceMeta'

type CareNavProp = StackNavigationProp<RootStackParamList, 'Care'>

const RING_SIZE = Dimensions.get('window').width * 0.9;
const RING_THICKNESS = 30;
const GAP = 1;
const CLOCK_STROKE_WIDTH = 5;
const CLOCK_STROKE_EXTRA = CLOCK_STROKE_WIDTH;
const OUTER_RADIUS = RING_SIZE / 2
const T = RING_THICKNESS
const G = GAP

const CareScreen: React.FC = () => {
  const navigation = useNavigation<CareNavProp>()
  const theme = useTheme()

  const todayISO = getTodayISO() // Get today's date in 'YYYY-MM-DD' format 

    // Derive shared constants:
    const WRAPPER_SIZE = RING_SIZE + CLOCK_STROKE_EXTRA * 2;
    const CENTER = WRAPPER_SIZE / 2;
    const INNERMOST_DIAMETER = RING_SIZE - 4 * (RING_THICKNESS + GAP);
    const CLOCK_RADIUS = INNERMOST_DIAMETER / 2 - RING_THICKNESS;
  
  // and for generating AI‐suggested slices
  const [showLast24h, setShowLast24h] = useState(false)
  const babyId = 'defaultBabyId'
  const { slices, nowFrac, loading, error, refresh } = 
  useTrackerSchedule(babyId, showLast24h)

  const [selectedSlice, setSelectedSlice] = useState<LogSlice | null>(null)
  const [sliceMode, setSliceMode] = useState<'view'|'confirm'|'edit'>('edit')

  const { confirmedIds, unconfirmedIds, aiSuggestedIds, reloadMeta } = useSliceMeta(slices, babyId)
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)

  
  // Bottom‐tab navigation handler
  const handleNavigate = (tab: MiniTab) => {
    if (tab === 'cards') navigation.navigate('PastLogs')
    else if (tab === 'tracker') return // already here
    else if (tab === 'graph') navigation.navigate('Insights')
    else if (tab === 'future') navigation.navigate('InferredLogs')
  }

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
  
    
  console.log(`[CareScreen] isEditingSchedule=${isEditingSchedule}  sliceMode=${sliceMode}`);
  return (
    <>
    <CareLayout activeTab="tracker" onNavigate={handleNavigate} bgColor={theme.colors.accent}>
      {/* ── 0. CONFIRM‐ALL BANNER ────────────────────────────────────────── */}
     {unconfirmedIds.length > 0 && (
       <View style={styles.confirmBanner}>
         <Text style={styles.confirmText}>
           You have {unconfirmedIds.length} past slice
           {unconfirmedIds.length > 1 ? 's' : ''} to confirm.
         </Text>
         <TouchableOpacity onPress={handleConfirmAll} style={styles.confirmButton}>
           <Text style={styles.confirmButtonText}>Confirm All</Text>
         </TouchableOpacity>
       </View>
     )}

     <Tracker
        slices={slices}
        nowFrac={nowFrac}
        onSlicePress={handleSlicePress}
        confirmedIds={confirmedIds}
        aiSuggestedIds={aiSuggestedIds}
        onResize={() => {
          // This is a no-op, but you can implement resizing logic if needed
        }}
        isEditingSchedule={isEditingSchedule}
      />

      {/* ── 2. Edit Schedule ─────────────────────────────────────────── */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => setIsEditingSchedule(true)} style={styles.iconWrapper}>
          <Text style={styles.confirmButtonText}>Edit Schedule</Text>
        </TouchableOpacity>
      </View>
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
  </>
  ) 
}

export default CareScreen

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // Icons section (flex:1)
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
