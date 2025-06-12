// src/screens/whispr/WhisprScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { queryWhispr } from '../../services/WhisprService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Voice from '@react-native-voice/voice';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { speakWithProfile } from '../../services/TTSService'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import VoiceSummaryButton from '../../components/common/VoiceSummaryButton';

import ChatHistoryModal from '../../components/whispr/ChatHistoryModal';
import WhisprVoiceLogo from '../../assets/whispr/WhisprVoiceLogo';
import LayerIcon from '../../assets/whispr/Layer';
import Arrow from '../../assets/whispr/Arrow';
import VoiceIcon from 'assets/harmonyscreen/playstoryscreen/VoiceIcon';
import { theme } from 'styles/theme';

type WhisprNavProp = StackNavigationProp<RootStackParamList, 'Whispr'>;

type Sender = 'user' | 'whispr' | 'error';
interface Message { text: string; sender: Sender; }
interface Thread { id: string; messages: Message[]; }
interface Log { id: string; babyId: string; timestamp: string; type: string; version: number; data: { method?: string; quantity?: number; unit?: 'oz' | 'mL'; subtype?: string }; }

let scrollRefMock: (opts: { animated: boolean }) => void = () => {};

function useSafeNavigation<T>() {
  try { return useNavigation<T>(); }
  catch { return undefined; }
}

const Logo = typeof WhisprVoiceLogo === 'function'
  ? WhisprVoiceLogo
  : () => <View style={{ width: 150, height: 150 }} />;

  const WhisprScreen: React.FC & { __setScrollRefMock: (fn: (opts: { animated: boolean }) => void) => void; } = () => {
    const navigation = useSafeNavigation<WhisprNavProp>();
    const [prompt, setPrompt] = useState('');
    const [threads, setThreads] = useState<Thread[]>([]);
    const [currentThreadIndex, setCurrentThreadIndex] = useState<number>(-1);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [showChatHistory, setShowChatHistory] = useState(false);
    const [logs, setLogs] = useState<Log[]>([]);
    const [defaultProfile, setDefaultProfile] = useState('default');
    const [isRecording, setIsRecording] = useState(false);
    const scrollRef = useRef<ScrollView>(null);

  // Load stored threads & restore last conversation
  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    const loadThreads = async () => {
      try {
        const stored = await AsyncStorage.getItem('whisprThreads');
        if (stored) {
          const parsed: Thread[] = JSON.parse(stored);
          setThreads(parsed);
          if (parsed.length > 0) {
            const lastIdx = parsed.length - 1;
            setCurrentThreadIndex(lastIdx);
            setMessages(parsed[lastIdx].messages);
          }
        }
        const rawProfile = await AsyncStorage.getItem('@tts_default_profile');
        if (rawProfile) setDefaultProfile(rawProfile);
      } catch (err) {
        console.error('[WhisprScreen] Failed to load threads:', err);
      }
    };
    loadThreads();
  }, []);

  // Fetch today’s logs from Firestore
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const babyId = await AsyncStorage.getItem('@baby_id');
        if (!babyId) return;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const q = query(
          collection(db, 'logs'),
          where('babyId', '==', babyId),
          where('timestamp', '>=', startOfDay.toISOString())
        );
        const snapshot = await getDocs(q);
        const fetchedLogs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Log[];
        setLogs(fetchedLogs);
      } catch (err) {
        console.error('[WhisprScreen] Failed to fetch logs:', err);
      }
    };
    fetchLogs();
  }, []);

  // Persist threads
  useEffect(() => {
    const saveThreads = async () => {
      try {
        await AsyncStorage.setItem('whisprThreads', JSON.stringify(threads));
      } catch (err) {
        console.error('[WhisprScreen] Failed to save threads:', err);
      }
    };
    saveThreads();
  }, [threads]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
    scrollRefMock({ animated: true });
  }, [messages]);

   // STT event handlers
  useEffect(() => {
       Voice.onSpeechStart = () => setIsRecording(true);
       Voice.onSpeechEnd   = () => setIsRecording(false);
       Voice.onSpeechResults = (e) => {
         const text = e.value?.[0] ?? '';
         setPrompt(text);
       };
       return () => {
         Voice.destroy().then(Voice.removeAllListeners);
       };
     }, []);

  const handleBack = () => navigation?.goBack();

  const handleSendPrompt = async (overridePrompt?: string) => {
    let text = overridePrompt ?? prompt;
    if (!text.trim()) {
      const lastUser = messages.slice().reverse().find(m => m.sender === 'user');
      if (lastUser) text = lastUser.text;
    }

    let idx = currentThreadIndex;
    if (idx < 0 || idx >= threads.length) {
      const newThread: Thread = { id: Date.now().toString(), messages: [] };
      setThreads(prev => [...prev, newThread]);
      idx = threads.length;
      setCurrentThreadIndex(idx);
    }

    setThreads(prev => {
      const clone = [...prev];
      clone[idx] = {
        ...clone[idx],
        messages: [...clone[idx].messages, { text, sender: 'user' }],
      };
      return clone;
    });
    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setPrompt('');
    setLoading(true);

    try {
      const reply = await queryWhispr(text);
      setThreads(prev => {
        const clone = [...prev];
        clone[idx] = {
          ...clone[idx],
          messages: [...clone[idx].messages, { text: reply, sender: 'whispr' }],
        };
        return clone;
      });
      setMessages(prev => [...prev, { text: reply, sender: 'whispr' }]);
      await speakWithProfile(reply, defaultProfile); // Updated to use profile
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setThreads(prev => {
        const clone = [...prev];
        clone[idx] = {
          ...clone[idx],
          messages: [...clone[idx].messages, { text: `Error: ${msg}`, sender: 'error' }],
        };
        return clone;
      });
      setMessages(prev => [...prev, { text: `Error: ${msg}`, sender: 'error' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceCommand = () => {
    console.log('Voice command pressed');
    // TODO: integrate speech-to-text
  };

  const handleDictate = async () => {
       try {
         if (!isRecording) {
           await Voice.start('en-US');
         } else {
           await Voice.stop();
         }
       } catch (e) {
         console.error('STT error:', e);
       }
     };

  const handleUpdateThreadName = (index: number, name: string) => {
    setThreads(prev => {
      const clone = [...prev];
      clone[index] = {
        ...clone[index],
        messages: [{ text: name, sender: 'user' }, ...clone[index].messages.slice(1)],
      };
      return clone;
    });
  };

  const handleDeleteThread = (index: number) => {
    setThreads(prev => prev.filter((_, i) => i !== index));
    if (index === currentThreadIndex) {
      const newLen = threads.length - 1;
      const newIdx = newLen > 0 ? newLen - 1 : -1;
      setCurrentThreadIndex(newIdx);
      setMessages(newIdx >= 0 ? threads[newIdx].messages : []);
    }
  };

  const handleNewChat = () => {
    const newThread: Thread = { id: Date.now().toString(), messages: [] };
    setThreads(prev => [...prev, newThread]);
    setCurrentThreadIndex(threads.length);
    setMessages([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity testID="back-button" onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>◀︎ Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="layer-icon"
          onPress={() => setShowChatHistory(true)}
          style={styles.layerButton}
        >
          <LayerIcon width={32} height={32} />
        </TouchableOpacity>
      </View>

      <Logo width={150} height={150} style={styles.logo} fill='#3C1642' />
      <Text style={styles.greetingText}>Hello, I’m Whispr.</Text>

      <View testID="suggestions" style={styles.suggestions}>
        {['Sleep', 'Feeding', 'Summary'].map(item => (
          <TouchableOpacity
            key={item}
            style={styles.suggestionButton}
            onPress={() => {
              if (item === 'Summary') return;
              handleSendPrompt(item);
            }}
          >
            {item === 'Summary' ? (
              <VoiceSummaryButton logs={logs} style={styles.summaryButton} />
            ) : (
              <Text style={styles.suggestionText}>{item}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ChatHistoryModal
        visible={showChatHistory}
        threads={threads}
        onClose={() => setShowChatHistory(false)}
        onSelectThread={thread => {
          const idx = threads.findIndex(t => t.id === thread.id);
          setCurrentThreadIndex(idx);
          setMessages(thread.messages);
          setShowChatHistory(false);
        }}
        onUpdateThreadName={handleUpdateThreadName}
        onDeleteThread={handleDeleteThread}
        onNewChat={handleNewChat}
      />

      <ScrollView style={styles.messagesContainer} ref={scrollRef}>
        {messages.map((m, i) => (
          <View
            key={i}
            style={[
              styles.messageBubble,
              m.sender === 'user'
                ? styles.userBubble
                : m.sender === 'whispr'
                ? styles.responseBubble
                : styles.errorBubble,
            ]}
          >
            <Text testID={m.sender === 'user' ? 'user-text' : 'response-text'}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputForm} testID="whispr-input-form">
        <View style={styles.inputRow}>
          <TextInput
            testID="input"
            placeholder="Ask Whispr"
            multiline
            textAlignVertical="top"
            numberOfLines={4}
            scrollEnabled
            value={prompt}
            onChangeText={setPrompt}
            style={[styles.input, { height: 80 }]}
          />
        </View>
        <View style={styles.buttonRow}>
          {prompt.trim() === '' ? (
             <>
             <TouchableOpacity testID="voice-command-button" onPress={handleVoiceCommand} style={styles.iconButton}>
               <Logo width={24} height={24} />
             </TouchableOpacity>
             <TouchableOpacity testID="dictate-button" onPress={handleDictate} style={styles.iconButton}>
               <VoiceIcon fill={theme.colors.primary} width={24} height={24} />
             </TouchableOpacity>
           </>
         ) : (
           <TouchableOpacity
             testID="send-button"
             onPress={() => handleSendPrompt()}
             disabled={loading}
             style={[styles.sendButton, loading && styles.sendButtonDisabled]}
           >
              <Arrow width={24} height={24} />
            </TouchableOpacity>
          )}
        </View>
        {loading && <Text testID="loading-spinner">Loading...</Text>}
        {isRecording && (
       <ActivityIndicator
         size="small"
         style={styles.recordingIndicator}
       />
     )}
      </View>
    </View>
  );
};

WhisprScreen.__setScrollRefMock = fn => {
  scrollRefMock = fn;
};

export default WhisprScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3A5C4',
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#000' },
  layerButton: { padding: 8 },
  logo: { alignSelf: 'center', marginVertical: 16 },
  greetingText: {
    fontFamily: 'Edrosa',
    fontSize: 24,
    textAlign: 'center',
    marginVertical: 16,
    color: '#000',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  suggestionButton: {
    width: 111,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#E9DAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  summaryButton: {
    backgroundColor: 'transparent',
    padding: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionText: {
    fontFamily: 'Edrosa',
    fontSize: 13,
    color: '#000',
  },
  messagesContainer: {
    flex: 1,
    width: width * 0.9,
    backgroundColor: '#E9DAFA',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  userBubble: { backgroundColor: '#DCF8C6', alignSelf: 'flex-end' },
  responseBubble: { backgroundColor: '#FFF', alignSelf: 'flex-start' },
  errorBubble: { backgroundColor: '#F8D7DA', alignSelf: 'flex-start' },
  inputForm: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 100,
    backgroundColor: '#E6E1F4',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    width: width * 0.9,
    paddingHorizontal: 15,
    marginVertical: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  inputRow: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  buttonRow: {
    position: 'absolute',           
    flexDirection: 'row',
    right: 15,
    bottom: 15,
    alignItems: 'center',
    },
  input: {
    flex: 1,
    fontFamily: 'Edrosa',
    fontSize: 16,
    color: '#312C38',
    paddingTop: 15,
    paddingLeft: 5,
  },
  sendButton: {
    padding: 8,
    backgroundColor: '#B3A5C4',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.25)',
  },
  sendButtonDisabled: { opacity: 0.5 },
  voiceButton: { padding: 8, backgroundColor: '#C4D8E2', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.25)' },
  voiceButtonText: { fontFamily: 'Edrosa', fontSize: 14, color: '#000' },
  dictateButton: { padding: 8, backgroundColor: '#E2D8C4', borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.25)' },
  dictateButtonText: { fontFamily: 'Edrosa', fontSize: 14, color: '#000' },
  recordingIndicator: {
        position: 'absolute',
        right: 75,
        bottom: 20,
      },
});