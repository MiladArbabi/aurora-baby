// src/components/carescreen/LogDetailModal.tsx
import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  PixelRatio,
} from 'react-native'
import { suggestTagsForSlice } from '../../services/TagSuggestionService'
import { bumpSliceVersionForEdit } from 'services/SliceVersioningService'
import { LogSlice } from '../../models/LogSlice'
import DeleteButton from '../../assets/icons/common/DeleteButton'

interface Props {
  visible: boolean
  slice: LogSlice
  onClose: () => void
  onDelete?: (id: string) => void
  onSave: (updated: LogSlice) => void
  mode: 'view' | 'confirm' | 'edit'
  onConfirm?: (id: string) => void
  suggestedTags?: string[]
  onAddTag?: (tag: string) => void
}

const FormField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value}</Text>
  </View>
)

const LogDetailModal: React.FC<Props> = ({ 
  visible, 
  slice, 
  onClose, 
  onDelete,
  onSave,
  onConfirm,
  mode,
  suggestedTags = [],
  onAddTag = () => {},
 }) => {
  if (!visible) return null

  // sizing
  const screenWidth = Dimensions.get('window').width
  const modalWidth  = screenWidth * 0.9
  const modalHeight = (modalWidth * 300) / 373
  const scale       = screenWidth / 375
  const scaledSize  = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scale))

  // compute display strings
  const startDt = new Date(slice.startTime)
  const endDt   = new Date(slice.endTime)

  const dateStringStart = startDt.toLocaleDateString()
  const timeStringStart = startDt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStringEnd   = endDt.toLocaleDateString()
  const timeStringEnd   = endDt.toLocaleTimeString([],   { hour: '2-digit', minute: '2-digit' })

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose} testID="log-detail-backdrop">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={[styles.modal, { width: modalWidth, height: modalHeight }]}>
        {/* Delete icon top-right */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete?.(slice.id)}
          testID="log-detail-delete"
        >
          <DeleteButton fill={'#FFF'} width={scaledSize(30)} height={scaledSize(30)} />
        </TouchableOpacity>

        {/* “Close” (✕) at top center */}
        <TouchableOpacity onPress={onClose} testID="log-detail-close">
          <Text style={styles.title}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Log Details</Text>
        <View style={styles.formContainer}>
          <FormField label="Category"   value={slice.category} />
          <FormField label="Start Date" value={dateStringStart} />
          <FormField label="Start Time" value={timeStringStart} />
          <FormField label="End Date"   value={dateStringEnd} />
          <FormField label="End Time"   value={timeStringEnd} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onClose} style={styles.actionBtn}>
            <Text style={styles.actionText}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Text>
          </TouchableOpacity>

          {mode === 'edit' && (
            <TouchableOpacity
              onPress={() => {
                const bumped = bumpSliceVersionForEdit(slice)
                onSave(bumped)
              }}
              style={styles.actionBtn}
              testID="log-detail-save"
            >
              <Text style={styles.actionText}>Save</Text>
            </TouchableOpacity>
          )}

          {mode === 'confirm' && onConfirm && (
            <TouchableOpacity
              onPress={() => onConfirm(slice.id)}
              style={styles.actionBtn}
              testID="log-detail-confirm"
            >
              <Text style={styles.actionText}>Confirm</Text>
            </TouchableOpacity>
          )}

        <View style={styles.chipContainer}>
          {suggestedTags.map(tag => (
            <TouchableOpacity key={tag} style={styles.tagChip} 
            onPress={() => onAddTag(tag)}>
              <Text style={styles.tagText}>#{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  deleteBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
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
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,              // or use margin on tagChip
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#E9DAFA',
    borderRadius: 16,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#38004D',
  },
})

export default LogDetailModal
