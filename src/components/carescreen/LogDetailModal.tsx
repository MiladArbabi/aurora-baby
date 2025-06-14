import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PixelRatio,
  ScrollView,
  KeyboardAvoidingView,
  TextInput,
  Platform,
} from 'react-native'
import DeleteButton from '../../assets/icons/common/DeleteButton'
import { LogSlice } from '../../models/LogSlice'
import { DateTimeDropdown } from 'components/common/DateTimeDropdown'
import { MoodSelector, Mood } from 'components/common/MoodSelector'
import { SwipeableModal } from 'components/common/SwipeableModal'
import { getLogSliceMeta } from 'storage/LogSliceMetaStorage'
import type { LogSliceMeta } from 'models/LogSliceMeta'
import { saveLogSliceMeta } from 'storage/LogSliceMetaStorage'
import { Picker } from '@react-native-picker/picker'

const CATEGORY_ICONS: Record<LogSlice['category'], string> = {
  awake: '🌅',
  sleep: '🌙',
  feed: '🍼',
  diaper: '💩',
  care: '🤱',
  talk: '💬',
  other: '✨',
}

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
  const [meta, setMeta] = useState<LogSliceMeta | null>(null)
  const [comments, setComments] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showPicker, setShowPicker] = useState<boolean>(false)

  const commonTags = ['play','nap','feed','happy','wet','messy']

  useEffect(() => {
        let cancelled = false
        getLogSliceMeta(slice.babyId, slice.id).then(m => {
          if (cancelled) return
          setMeta(m ?? null)
          setComments(m?.notes || '')
          setSelectedTags(m?.tags || [])
        })
        return () => { cancelled = true }
      }, [slice.babyId, slice.id])

  const screenWidth = Dimensions.get('window').width
  const scale = screenWidth / 375
  const scaled = (n: number) => Math.round(PixelRatio.roundToNearestPixel(n * scale))

  return (
    <SwipeableModal visible={visible} onClose={onClose}>
      {/* Delete button */}
      <TouchableOpacity
        onPress={() => onDelete?.(slice.id)}
        style={styles.deleteBtn}
        accessibilityLabel="Delete log"
      >
        <DeleteButton fill="#FFF" width={scaled(24)} height={scaled(24)} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoider}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.scroll}  
          contentContainerStyle={[styles.content, { flexGrow: 1 }]}          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* CATEGORY SELECTION */}
          <View style={styles.categoryHeader}>
            {mode === 'edit' ? (
              <Picker
                selectedValue={slice.category}
                style={styles.categoryPicker}
                onValueChange={cat => onSave({ ...slice, category: cat })}
              >
                {Object.keys(CATEGORY_ICONS).map(cat => (
                  <Picker.Item
                    key={cat}
                    label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                    value={cat}
                  />
                ))}
              </Picker>
            ) : (
              <>
                <Text style={styles.categoryIcon}>
                  {CATEGORY_ICONS[slice.category]}
                </Text>
                <Text style={styles.categoryText}>
                  {slice.category.toUpperCase()}
                </Text>
              </>
            )}
          </View>

          {/* Time section */}
          <DateTimeDropdown
            label="Start"
            value={new Date(slice.startTime)}
            onChange={d => onSave({ ...slice, startTime: d.toISOString() })}
            disabled={mode !== 'edit'}
            accessibilityLabel="Select start time"
          />

          <DateTimeDropdown
            label="End"
            value={new Date(slice.endTime)}
            onChange={d => onSave({ ...slice, endTime: d.toISOString() })}
            disabled={mode !== 'edit'}
            accessibilityLabel="Select end time"
          />

          {/* Awake-specific */}
          {slice.category === 'awake' && (
            <>
              <Text style={styles.sectionTitle}>Wake‑up Mood</Text>
              <MoodSelector
                label="Wake‑up Mood"
                value={'neutral'}
                onSelect={m => {
                  // TODO: persist mood to meta
                }}
                disabled={mode !== 'edit'}
                accessibilityLabel="Select wake‑up mood"
              />

              <Text style={styles.sectionTitle}>Wake Method</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioBtn}
                  accessibilityLabel="Woke by child"
                >
                  <Text style={styles.radioText}>Child</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioBtn}
                  accessibilityLabel="Woke naturally"
                >
                  <Text style={styles.radioText}>Natural</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* Comments */}
          <Text style={styles.sectionTitle}>Comments</Text>
          <TextInput
            style={styles.commentsInput}
            placeholder="Add comments..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            multiline
            value={comments}
            onChangeText={setComments}
            editable={mode === 'edit'}
            accessibilityLabel="Comments input"
          />

          {/* Selected tags */}
        {selectedTags.length > 0 && (
          <View style={styles.selectedChips}>
            {selectedTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.selectedTagChip}
                onPress={() => {
                  setSelectedTags(prev => prev.filter(t => t !== tag))
                  onAddTag(tag /* or a removeTag callback */)
                }}
                accessibilityLabel={`Remove tag ${tag}`}
              >
                <Text style={styles.selectedTagText}>× {tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

          {/* Separator & Tags */}
          <View style={styles.separator} />
          <View style={styles.tagsHeader}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <TouchableOpacity
              onPress={() => setShowPicker(p => !p)}
              style={styles.addTagBtn}
              accessibilityLabel="Show tag picker"
            >
              <Text style={styles.addTagText}>＋</Text>
            </TouchableOpacity>
          </View>

          {/* inline picker */}
          {showPicker && (
            <View style={styles.pickerContainer}>
              {commonTags.map(t => (
                <TouchableOpacity
                  key={t}
                  style={styles.pickerTag}
                  onPress={() => {
                    if (!selectedTags.includes(t)) {
                      setSelectedTags(ts => [...ts, t])
                      onAddTag(t)
                    }
                    setShowPicker(false)
                  }}
                >
                  <Text style={styles.pickerTagText}>+ #{t}</Text>
                </TouchableOpacity>
              ))}
              {commonTags.length === 0 && (
                <Text style={styles.noSuggestions}>No tags available</Text>
              )}
            </View>
          )}
      
        </ScrollView>
                {/* ── Footer with Save / Confirm / Close buttons ── */}
                <View style={styles.footer}>
          {mode === 'edit' && (
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={async () => {
                  // 1) save updated slice
                    onSave({ ...slice })
                   // 2) persist metadata
                   if (meta) {
                     const updatedMeta: LogSliceMeta = {
                    ...meta,
                    notes: comments,
                    tags: selectedTags,
                      edited: true,
                     lastModified: new Date().toISOString(),
                    }
                   await saveLogSliceMeta(slice.babyId, updatedMeta)
                  setMeta(updatedMeta)
                 }
               }}
               >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
          {mode === 'confirm' && onConfirm && (
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: '#4CAF50' }]}
              onPress={() => onConfirm(slice.id)}
            >
              <Text style={styles.saveText}>Confirm</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#888' }]}
            onPress={onClose}
          >
            <Text style={styles.saveText}>
              {mode === 'view' ? 'Close' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SwipeableModal>
  )
}

const styles = StyleSheet.create({
  deleteBtn: { position: 'absolute', top: 12, right: 12, zIndex: 10 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 40 },
  categoryHeader: { alignItems: 'center', marginBottom: 16, width: '100%' },
  categoryIcon: { fontSize: 36 },
  categoryText: { color: '#E9DAFA', fontSize: 20, fontWeight: '600', marginTop: 6 },
  sectionTitle: { color: '#E9DAFA', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  radioGroup: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 },
  radioBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#E9DAFA', borderRadius: 12 },
  radioText: { color: '#E9DAFA', fontSize: 14 },
  commentsInput: { minHeight: 60, borderWidth: 1, borderColor: '#E9DAFA', borderRadius: 8, color: '#FFF', padding: 8, marginBottom: 16 },
  separator: { width: '90%', height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginVertical: 16 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  tagChip: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#E9DAFA', borderRadius: 16, margin: 4 },
  tagText: { fontSize: 12, color: '#38004D' },
  footer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: '#38004D',
      },
      saveBtn: {
        flex: 1,
        marginHorizontal: 8,
        paddingVertical: 10,
        backgroundColor: '#E9DAFA',
        borderRadius: 8,
        alignItems: 'center',
      },
      saveText: {
        color: '#38004D',
        fontSize: 16,
        fontWeight: '600',
    },
    avoider: { flex: 1 },
    scroll: { flex: 1, paddingBottom: 75 },
    selectedChips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, paddingHorizontal: 16 },
  selectedTagChip: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 4,
  },
  selectedTagText: {
    color: '#38004D',
    fontWeight: '600',
  },
  tagChipSelected: {
    opacity: 0.5,
  },
  tagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addTagBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addTagText: {
    fontSize: 18,
    color: '#E9DAFA',
  },
  pickerContainer: {
    backgroundColor: '#49265F',
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  pickerTag: {
    paddingVertical: 6,
  },
  pickerTagText: {
    color: '#E9DAFA',
    fontSize: 14,
  },
  noSuggestions: {
    color: 'rgba(255,255,255,0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 8,
  },
  categoryPicker: {
    width: '60%',
    color: '#E9DAFA',
  },
})

export default LogDetailModal
