import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';

const { width } = Dimensions.get('window');

type Sender = 'user' | 'whispr' | 'error';
interface Message {
  text: string;
  sender: Sender;
}

interface ChatHistoryModalProps {
  visible: boolean;
  threads: Message[][];
  onClose: () => void;
  onSelectThread: (thread: Message[]) => void;
  onUpdateThreadName: (index: number, name: string) => void;
  onDeleteThread: (index: number) => void;
  onNewChat: () => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  visible,
  threads,
  onClose,
  onSelectThread,
  onUpdateThreadName,
  onDeleteThread,
  onNewChat,
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const handleEditName = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditName(currentName);
  };

  const handleSaveName = (index: number) => {
    onUpdateThreadName(index, editName);
    setEditingIndex(null);
    setEditName('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => {
              onNewChat();
              onClose();
            }}
            testID="new-chat-button"
          >
            <Text style={styles.newChatButtonText}>New Chat</Text>
          </TouchableOpacity>
          <ScrollView style={styles.modalContent}>
            {threads.map((thread, index) => {
              const defaultName = thread.find(m => m.sender === 'user')?.text ?? `Chat ${index + 1}`;
              const threadName = thread[0]?.text || defaultName;
              return (
                <View key={index} style={styles.threadItem}>
                  {editingIndex === index ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={editName}
                        onChangeText={setEditName}
                        autoFocus
                        onSubmitEditing={() => handleSaveName(index)}
                        testID={`edit-thread-name-${index}`}
                      />
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleSaveName(index)}
                        testID={`save-thread-name-${index}`}
                      >
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.threadHeader}
                      onPress={() => {
                        onSelectThread(thread);
                        onClose();
                      }}
                      testID={`thread-${index}`}
                    >
                      <Text style={styles.threadHeaderText}>{threadName}</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.threadActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEditName(index, threadName)}
                      testID={`edit-thread-${index}` }
                    >
                      <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => onDeleteThread(index)}
                      testID={`delete-thread-${index}`}
                    >
                      <Text style={styles.actionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ChatHistoryModal;

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: width * 0.8,
    height: '100%',
    backgroundColor: '#FFF',
    alignSelf: 'flex-end',
    padding: 24,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 12,
  },
  modalCloseText: {
    fontFamily: 'Edrosa',
    fontSize: 16,
    color: '#000',
  },
  newChatButton: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#E9DAFA',
    borderRadius: 25,
    marginBottom: 16,
  },
  newChatButtonText: {
    fontFamily: 'Edrosa',
    fontSize: 16,
    color: '#000',
  },
  modalContent: {
    flex: 1,
  },
  threadItem: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9DAFA',
    paddingBottom: 8,
  },
  threadHeader: {
    padding: 12,
  },
  threadHeaderText: {
    fontFamily: 'Edrosa',
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
  },
  threadActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 12,
  },
  actionButton: {
    padding: 8,
  },
  actionButtonText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#312C38',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  editInput: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E9DAFA',
    borderRadius: 8,
    padding: 8,
  },
  saveButton: {
    padding: 8,
    backgroundColor: '#E9DAFA',
    borderRadius: 8,
  },
  saveButtonText: {
    fontFamily: 'Edrosa',
    fontSize: 14,
    color: '#000',
  },
});