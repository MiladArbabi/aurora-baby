import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
  PixelRatio,
  ScrollView,
} from 'react-native'
import DeleteButton from '../../assets/icons/common/DeleteButton'
import { LogSlice } from '../../models/LogSlice'
import { DateTimeDropdown } from 'components/common/DateTimeDropdown'
import { MoodSelector, Mood } from 'components/common/MoodSelector'
import { SwipeableModal } from 'components/common/SwipeableModal'

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

  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const scale = screenWidth / 375
  const scaled = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scale))

  return (
    <SwipeableModal visible={visible} onClose={onClose}>

        {/* Delete button */}
        <TouchableOpacity onPress={() => onDelete?.(slice.id)} style={styles.deleteBtn}>
          <DeleteButton fill="#FFF" width={scaled(24)} height={scaled(24)} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category icon + name */}
          <View style={styles.categoryHeader}>
            {/* Replace with your category-icon mapping */}
            <Text style={styles.categoryIcon}>🌅</Text>
            <Text style={styles.categoryText}>{slice.category.toUpperCase()}</Text>
          </View>

          {/* Time section */}
            <DateTimeDropdown
              label="Start"
              value={new Date(slice.startTime)}
              disabled={mode !== 'edit'}
              onChange={(newDate: Date) =>
                onSave({ ...slice, startTime: newDate.toISOString() })
              }
            />

            <DateTimeDropdown
              label="End"
              value={new Date(slice.endTime)}
              disabled={mode !== 'edit'}
              onChange={(newDate: Date) =>
                onSave({ ...slice, endTime: newDate.toISOString() })
              }
            />

          {/* Category-specific fields */}
          {slice.category === 'awake' && (
            <>
              <Text style={styles.sectionTitle}>Wake-up Mood</Text>
              <MoodSelector
                label="Wake-up Mood"
                value={'neutral'} 
                onSelect={(m: Mood) => {
                       /* update your slice.meta.mood and save via saveLogSliceMeta(...) */
                     }}
                disabled={mode !== 'edit'}
              />
              <Text style={styles.sectionTitle}>Wake Method</Text>
              {/* Could be radio buttons: Child vs Natural */}
              <View style={styles.radioGroup}>
                <TouchableOpacity style={styles.radioBtn}><Text>Child</Text></TouchableOpacity>
                <TouchableOpacity style={styles.radioBtn}><Text>Natural</Text></TouchableOpacity>
              </View>
            </>
          )}

          {/* Comments field placeholder */}
          <Text style={styles.sectionTitle}>Comments</Text>
          <View style={styles.textInputPlaceholder}>
            <Text style={styles.sectionTitle} >Tap to add comments...</Text>
          </View>

          {/* Tags */}
          <View style={styles.separator} />
          <Text style={styles.sectionTitle}>Tags</Text>
          <View style={styles.chipContainer}>
            {suggestedTags.map(tag => (
              <TouchableOpacity key={tag} style={styles.tagChip} onPress={() => onAddTag(tag)}>
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
    </SwipeableModal>
  )
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
    marginVertical: 2,
  },
  separator: {
    width: '90%', 
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginVertical: 6,
  },
  deleteBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  content: { paddingBottom: 24, paddingVertical: 8 },
  categoryHeader: { alignItems: 'center', marginVertical: 6 },
  categoryIcon: { fontSize: 36 },
  categoryText: { color: '#E9DAFA', fontSize: 20, fontWeight: '600', marginTop: 6 },
  sectionTitle: { color: '#E9DAFA', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  radioGroup: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  radioBtn: { padding: 8, borderWidth: 1, borderColor: '#E9DAFA', borderRadius: 12 },
  textInputPlaceholder: { height: 40, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, justifyContent: 'center', paddingHorizontal: 8, marginVertical: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 18 },
  tagChip: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#E9DAFA', borderRadius: 16, margin: 4 },
  tagText: { fontSize: 12, color: '#FFFFFF' },
})

export default LogDetailModal
