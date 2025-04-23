// src/components/carescreen/LogDetailModal.tsx
import React from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native'
import { QuickLogEntry } from '../../models/QuickLogSchema'

interface Props {
  visible: boolean
  entry: QuickLogEntry
  onClose: () => void
}

const LogDetailModal: React.FC<Props> = ({ visible, entry, onClose }) => {
  if (!visible || !entry) return null

  const { type, timestamp, data } = entry

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
    >
      {/* backdrop */}
      <TouchableWithoutFeedback onPress={onClose} testID="log-detail-backdrop">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* sheet */}
      <View style={styles.container}>
        {/* close button */}
        <TouchableOpacity onPress={onClose} testID="log-detail-close" style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Log Details</Text>
        <Text>Type: {type}</Text>
        <Text>At: {new Date(timestamp).toLocaleString()}</Text>

        {type === 'note' && (
          <View style={styles.section}>
            <Text>Note:</Text>
            {/* this standalone Text is what getByText(...) will match */}
            <Text>{(data as { text: string }).text}</Text>
          </View>
        )}

        {type === 'sleep' && (
          <View style={styles.section}>
            <Text>Start: {new Date((data as any).start).toLocaleString()}</Text>
            <Text>End:   {new Date((data as any).end).toLocaleString()}</Text>
            <Text>Duration: {(data as any).duration} min</Text>
          </View>
        )}

        {/* you can branch out for feeding, diaper, etc. later */}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  closeText: {
    fontSize: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  section: {
    marginTop: 12,
  },
})

export default LogDetailModal
