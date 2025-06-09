// src/components/common/SwipeableModal.tsx
import React, { useRef } from 'react'
import {
  Modal,
  View,
  Animated,
  PanResponder,
  Dimensions,
  StyleSheet,
} from 'react-native'

interface SwipeableModalProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
}

export const SwipeableModal: React.FC<SwipeableModalProps> = ({
  visible,
  onClose,
  children,
}) => {
  const translateY = useRef(new Animated.Value(0)).current
  const screenHeight = Dimensions.get('window').height

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dy }) => {
      if (dy > 0) translateY.setValue(dy)
    },
    onPanResponderRelease: (_, { dy, vy }) => {
      const shouldClose = dy > 100 || vy > 0.5
      if (shouldClose) {
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 200,
          useNativeDriver: true,
        }).start(onClose)
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          bounciness: 6,
          useNativeDriver: true,
        }).start()
      }
    },
  })

  if (!visible) return null

  return (
    <Modal visible transparent animationType="none">
      <View style={styles.backdrop} />
      <Animated.View
        style={[styles.modalContainer, { transform: [{ translateY }] }]}
      >
        {/* only this handle bar will respond to vertical drags */}
        <View {...panResponder.panHandlers} style={styles.handle} />
        {children}
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#38004D',
    borderRadius: 16,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 2,
    marginVertical: 8,
  },
})
