// src/hooks/useActionMenuLogic.ts
import { useEffect, useState, useCallback } from 'react';
import { getLogsGroupedByDate } from '../services/QuickLogAccess';
import { saveLastScreen } from '../services/LastScreenTracker';
import { useVoiceRecorder } from './useVoiceRecorder';

export function useActionMenuLogic() {
  const [modalVisible, setModalVisible] = useState(false);
  const [quickLogMenuVisible, setQuickLogMenuVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracker'|'graph'|'cards'>('tracker');
  const recorder = useVoiceRecorder();

  useEffect(() => {
    saveLastScreen('Home');
  }, []);

  useEffect(() => {
    getLogsGroupedByDate().then(logs => console.debug('[DEBUG] Grouped Logs:', logs));
  }, []);

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);
  const openQuickLog = useCallback(() => setQuickLogMenuVisible(true), []);
  const closeQuickLog = useCallback(() => setQuickLogMenuVisible(false), []);

  const handleVoiceCommand = useCallback(async () => {
    closeQuickLog();
    try {
      await recorder.start();
      await recorder.stop();
      console.debug('Heard:', recorder.transcript);
    } catch (err) {
      console.warn('Voice command failed:', err);
    }
  }, [recorder, closeQuickLog]);

  return {
    modalVisible,
    quickLogMenuVisible,
    activeTab,
    setActiveTab,
    openModal,
    closeModal,
    openQuickLog,
    closeQuickLog,
    handleVoiceCommand,
    recorder, // in case you want isListening or error
  };
}
