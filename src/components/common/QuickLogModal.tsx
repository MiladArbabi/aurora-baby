// src/components/common/QuickLogModal.tsx
import React from 'react';
import { Modal } from 'react-native';
import QuickLogMenu from '../carescreen/QuickLogMenu';

interface QuickLogModalProps {
       visible: boolean;
       onClose: () => void;
     }

     export default function QuickLogModal({ visible, onClose }: QuickLogModalProps) {
  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={onClose}>
      <QuickLogMenu onClose={onClose} />
    </Modal>
  );
}