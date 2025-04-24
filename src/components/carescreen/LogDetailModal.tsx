// src/components/carescreen/LogDetailModal.tsx
import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  PixelRatio
} from 'react-native'
import { QuickLogEntry } from '../../models/QuickLogSchema'

// TSX icon components generated via SVGR
import Handlebar from '../../assets/carescreen/LogDetailModalIcons/Handelbar'
import SleepIcon from '../../assets/carescreen/LogDetailModalIcons/Sleep'
import FeedIcon from '../../assets/carescreen/LogDetailModalIcons/Feeding'
import DiaperIcon from '../../assets/carescreen/LogDetailModalIcons/Diaper'
import MoodIcon from '../../assets/carescreen/LogDetailModalIcons/Mood'
import NoteIcon from '../../assets/carescreen/LogDetailModalIcons/Note'
import HealthIcon from '../../assets/carescreen/LogDetailModalIcons/Health'

interface Props {
  visible: boolean
  entry: QuickLogEntry
  onClose: () => void
  onSave?: (entry: QuickLogEntry) => void
}

const iconMap: Record<QuickLogEntry['type'], React.ComponentType<any>> = {
  sleep:   SleepIcon,
  feeding: FeedIcon,
  mood:    MoodIcon,
  diaper:  DiaperIcon,
  note:    NoteIcon,
  health:  HealthIcon,
}

const LogDetailModal: React.FC<Props> = ({ visible, entry, onClose, onSave }) => {
  if (!visible) return null

  const { type, timestamp, data } = entry
  const screenWidth = Dimensions.get('window').width
  const modalWidth = screenWidth * 0.9
  const modalHeight = modalWidth * (300 / 373)
  const scale = Dimensions.get('window').width / 375
  function scaledSize(size: number) { return Math.round(PixelRatio.roundToNearestPixel(size * scale)) }

  const date = new Date(timestamp).toLocaleDateString()
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const [startTime] = useState(time)
  const [endTime]   = useState(time)
  const [details]   = useState(type === 'note' ? (data as any).text : '')
  const [subtype, setSubtype] = useState(
    // pull from entry.data if it already exists,
    // e.g. for a diaper log you might have data.subtype
    (data as any).subtype || ''
  )
  const [dateValue, setDateValue] = useState(date)

  const IconComponent = iconMap[type]

  const handleSave = () => {
    if (onSave) onSave(entry)
    else onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose} testID="log-detail-backdrop">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.modal, { width: modalWidth, height: modalHeight }]}>        
        {/* Tap the handlebar to close */}
        <TouchableOpacity onPress={onClose} testID="log-detail-close">
          <Handlebar width={150} height={10} style={styles.handlebar} />
        </TouchableOpacity>

        <View style={styles.iconWrapper}>
          <View style={styles.iconEdge}>
            <View style={styles.iconBg}>
              <IconComponent width={75} height={75} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Log Details</Text> 
        <View style={styles.formContainer}>
        {/* 1️⃣ Subtype selector */}
          <TouchableOpacity style={styles.field} onPress={() => {/* open your subtype picker */}}>
            <Text style={styles.fieldLabel}>Subtype</Text>
            <Text style={styles.fieldValue}>{subtype}</Text>
          </TouchableOpacity> 
        {/* 2️⃣ Date picker */}
          <TouchableOpacity style={styles.field} onPress={() => {}}>
            <Text style={styles.fieldLabel}>Date</Text>
            <Text style={styles.fieldValue}>{date}</Text>
          </TouchableOpacity>
        {/* 3️⃣ Start time picker */}
          <TouchableOpacity style={styles.field} onPress={() => {/* open your time picker */}}>
            <Text style={styles.fieldLabel}>Start</Text>
            <Text style={styles.fieldValue}>{startTime}</Text>
          </TouchableOpacity>
        {/* 4️⃣ End time picker */}
          <TouchableOpacity style={styles.field} onPress={() => {/* open your time picker */}}>
            <Text style={styles.fieldLabel}>End</Text>
            <Text style={styles.fieldValue}>{endTime}</Text>
          </TouchableOpacity>  

          {type === 'sleep' && (
            <>
              <TouchableOpacity style={styles.field} onPress={() => {}}>
                <Text style={styles.fieldLabel}>Start</Text>
                <Text style={styles.fieldValue}>{startTime}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.field} onPress={() => {}}>
                <Text style={styles.fieldLabel}>End</Text>
                <Text style={styles.fieldValue}>{endTime}</Text>
              </TouchableOpacity>
            </>
          )}
          {type === 'note' && (
            <TouchableOpacity style={styles.field} onPress={() => {}}>
              <Text style={styles.fieldLabel}>Note</Text>
              <Text style={styles.fieldValue}>{details}</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.actionBtn} testID="log-detail-cancel">
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={styles.actionBtn} testID="log-detail-save">
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modal: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    backgroundColor: '#38004D',
    borderColor: '#E9DAFA',
    borderWidth: 1,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },
  handlebar: { alignSelf: 'center', marginBottom: 16 },
  iconWrapper: { position: 'absolute', top: 24, left: 24 },
  iconEdge: { width: 75, height: 75, borderRadius: 25, backgroundColor: '#B3A5C4', justifyContent: 'center', alignItems: 'center' },
  iconBg: { width: 72, height: 72, borderRadius: 25, backgroundColor: '#312C38', justifyContent: 'center', alignItems: 'center' },
  title: { marginTop: 24, fontFamily: 'Edrosa', fontSize: 18, fontWeight: '600', color: '#E9DAFA', alignSelf: 'center' },
  formContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',   // spread items into two columns
    marginTop: 32,
    marginBottom: 12,                 // gives breathing room before the action buttons
  },
  field: {
    width: '48%',                     // two per row
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D7D7D7',
    borderColor: '#E9DAFA',
    borderWidth: 3,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 35,
    marginBottom: 15,                 // vertical spacing between rows
  },
  fieldLabel: { fontFamily: 'Edrosa', fontSize: 12, color: '#000' },
  fieldValue: { fontFamily: 'Inter', fontSize: 12, color: '#000' },
  actions: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E9DAFA', borderRadius: 25, borderColor: '#FFFFFF', borderWidth: 2, width: 75, height: 30, justifyContent: 'center', gap: 8 },
  actionText: { fontFamily: 'Edrosa', fontSize: 16, color: '#000' },
})

export default LogDetailModal