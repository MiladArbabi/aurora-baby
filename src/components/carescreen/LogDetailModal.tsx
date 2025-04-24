import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native'
import { QuickLogEntry } from '../../models/QuickLogSchema'

// SVGR’d TSX icons
import Handlebar   from '../../assets/carescreen/LogDetailModalIcons/Handelbar'
import SleepIcon   from '../../assets/carescreen/LogDetailModalIcons/Sleep'
import FeedIcon    from '../../assets/carescreen/LogDetailModalIcons/Feeding'
import DiaperIcon  from '../../assets/carescreen/LogDetailModalIcons/Diaper'
import MoodIcon    from '../../assets/carescreen/LogDetailModalIcons/Mood'
import NoteIcon    from '../../assets/carescreen/LogDetailModalIcons/Note'
import HealthIcon  from '../../assets/carescreen/LogDetailModalIcons/Health'

// 2×2 grid field
const FormField: React.FC<{ label: string; value: string; onPress: () => void }> =
  ({ label, value, onPress }) => (
    <TouchableOpacity style={styles.field} onPress={onPress}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </TouchableOpacity>
  )

interface Props {
  visible: boolean
  entry: QuickLogEntry
  onClose: () => void
  onSave?: (entry: QuickLogEntry) => void
}

const iconMap: Record<QuickLogEntry['type'], React.ComponentType<any>> = {
  sleep:   SleepIcon,
  feeding: FeedIcon,
  diaper:  DiaperIcon,
  mood:    MoodIcon,
  note:    NoteIcon,
  health:  HealthIcon,
}

const LogDetailModal: React.FC<Props> = ({ visible, entry, onClose, onSave }) => {
  if (!visible) return null

  const { type, timestamp, data } = entry

  // sizing
  const screenWidth = Dimensions.get('window').width
  const modalWidth  = screenWidth * 0.9
  const modalHeight = (modalWidth * 300) / 373
  const scale       = screenWidth / 375
  const scaledSize  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scale))

  // initial display
  const dateString = new Date(timestamp).toLocaleDateString()
  const timeString = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  // form state
  const [dateValue, setDateValue]       = useState(dateString)
  const [startTime, setStartTime]       = useState(timeString)
  const [endTime, setEndTime]           = useState(timeString)
  const [details, setDetails]           = useState(type === 'note' ? (data as any).text : '')
  const initialSubtype =
    type === 'sleep'   ? (data as any).subtype ?? '' :
    type === 'feeding' ? (data as any).method      :
    type === 'diaper'  ? (data as any).status      :
    type === 'mood'    ? (data as any).subtype     :
    type === 'health'  ? (data as any).subtype     :
    ''
  const [subtype, setSubtype] = useState(initialSubtype)

  const IconComponent = iconMap[type]

  // save → only rebuild timestamp for those types that have time fields
  const handleSave = () => {
    let updated = { ...entry } as any

    if (type === 'sleep' || type === 'health') {
      // compose from date + startTime
      const iso = new Date(`${dateValue} ${startTime}`).toISOString()
      updated.timestamp = iso
    }
    // feeding, diaper, mood → use date+timeString
    else if (type === 'feeding' || type === 'diaper' || type === 'mood') {
      const iso = new Date(`${dateValue} ${startTime}`).toISOString()
      updated.timestamp = iso
    }
    // note → keep original timestamp (or you could override with dateValue alone)

    onSave?.(updated)
    onClose()
  }

  // render the correct 2×2 (or 3×1) grid per type
  const renderFields = () => {
    switch (type) {
      case 'sleep':
        return (
          <>
            <FormField label="Subtype" value={subtype} onPress={() => {/* picker */}} />
            <FormField label="Date"    value={dateValue} onPress={() => {/* picker */}} />
            <FormField label="Start"   value={startTime} onPress={() => {/* picker */}} />
            <FormField label="End"     value={endTime} onPress={() => {/* picker */}} />
          </>
        )

      case 'feeding':
      case 'diaper':
      case 'mood':
        return (
          <>
            <FormField
              label={type === 'feeding' ? 'Method' : type === 'diaper' ? 'Status' : 'Mood'}
              value={subtype}
              onPress={() => {/* picker */}}
            />
            <FormField label="Date" value={dateValue} onPress={() => {/* date picker */}} />
            <FormField label="Time" value={startTime} onPress={() => {/* time picker */}} />
          </>
        )

      case 'health':
        return (
          <>
            <FormField label="Type"  value={subtype} onPress={() => {/* picker */}} />
            <FormField label="Date"  value={dateValue} onPress={() => {/* date */}} />
            <FormField label="Start" value={startTime} onPress={() => {/* time */}} />
            <FormField label="End"   value={endTime} onPress={() => {/* time */}} />
          </>
        )

      case 'note':
        return (
          <>
            <FormField label="Date" value={dateValue} onPress={() => {/* date */}} />
            <Text style={styles.notePreview}>{details}</Text>
            <TextInput
              style={styles.noteInput}
              multiline
              value={details}
              onChangeText={setDetails}
            />
          </>
        )
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose} testID="log-detail-backdrop">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.modal, { width: modalWidth, height: modalHeight }]}>
        {/* drag handle closes */}
        <TouchableOpacity onPress={onClose} testID="log-detail-close">
          <Handlebar
            width={scaledSize(150)}
            height={scaledSize(10)}
            style={styles.handlebar}
          />
        </TouchableOpacity>

        {/* icon */}
        <View style={styles.iconWrapper}>
          <View style={styles.iconEdge}>
            <View style={styles.iconBg}>
              <IconComponent
                width={scaledSize(75)}
                height={scaledSize(75)}
              />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Log Details</Text>
        <View style={styles.formContainer}>{renderFields()}</View>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.actionBtn}
            testID="log-detail-cancel"
          >
            <Text style={styles.actionText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={styles.actionBtn}
            testID="log-detail-save"
          >
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
  handlebar: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
  iconEdge: {
    width: 75,
    height: 75,
    borderRadius: 25,
    backgroundColor: '#B3A5C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 25,
    backgroundColor: '#312C38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginTop: 24,
    fontFamily: 'Edrosa',
    fontSize: 18,
    fontWeight: '600',
    color: '#E9DAFA',
    alignSelf: 'center',
  },
  formContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: 12,
  },
  field: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#D7D7D7',
    borderColor: '#E9DAFA',
    borderWidth: 3,
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 35,
    marginBottom: 15,
  },
  fieldLabel: { fontFamily: 'Edrosa', fontSize: 12, color: '#000' },
  fieldValue: { fontFamily: 'Inter', fontSize: 12, color: '#000' },
  noteInput: {
    width: '100%',
    minHeight: 80,
    backgroundColor: '#D7D7D7',
    borderColor: '#E9DAFA',
    borderWidth: 3,
    borderRadius: 25,
    padding: 12,
    fontFamily: 'Inter',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9DAFA',
    borderRadius: 25,
    borderColor: '#FFF',
    borderWidth: 2,
    width: 75,
    height: 30,
    justifyContent: 'center',
    gap: 8,
  },
  actionText: { fontFamily: 'Edrosa', fontSize: 16, color: '#000' },
  notePreview:{
    width: '100%',
    fontFamily: 'Inter',
    fontSize: 12,
    color: '#000',
    marginBottom: 8
  }
});

export default LogDetailModal;