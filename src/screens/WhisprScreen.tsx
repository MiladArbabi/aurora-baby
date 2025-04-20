// src/screens/WhisprScreen.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from 'navigation/AppNavigator';
import { queryWhispr } from '../services/WhisprService';
import WhisprVoiceLogo from '../assets/whispr/WhisprVoiceLogo.svg';

type WhisprNavProp = StackNavigationProp<RootStackParamList, 'Whispr'>;

const Logo = typeof WhisprVoiceLogo === 'function'
  ? WhisprVoiceLogo
  : () => <View style={{ width: 150, height: 150 }} />;

type Sender = 'user' | 'whispr' | 'error';
interface Message {
  text: string;
  sender: Sender;
}

// module‐scope mock hook for tests
let scrollRefMock: (opts: { animated: boolean }) => void = () => {};

// custom hook: safe navigation that won't throw if no context
function useSafeNavigation<T>() {
  try {
    return useNavigation<T>();
  } catch {
    return undefined;
  }
}

const WhisprScreen: React.FC & {
  __setScrollRefMock: (fn: (opts: { animated: boolean }) => void) => void;
} = () => {
  const navigation = useSafeNavigation<WhisprNavProp>();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd?.({ animated: true });
    scrollRefMock({ animated: true });
  }, [messages]);

  const handleGoBack = () => {
    if (navigation) navigation.goBack();
  };

  const handleSendPrompt = async (overridePrompt?: string) => {
    const text = overridePrompt ?? prompt;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { text, sender: 'user' }]);
    setPrompt('');
    setLoading(true);

    try {
      const reply = await queryWhispr(text);
      setMessages(prev => [...prev, { text: reply, sender: 'whispr' }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev => [
        ...prev,
        { text: `Error: ${msg}`, sender: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button
      title="◀︎ Back"
      onPress={handleGoBack}
      />
      <Logo width={150} height={150} />
      <Text style={styles.greetingText}>Hello, I'm Whispr.</Text>
      <View testID="suggestions" style={styles.suggestions}>
        {['Sleep', 'Feeding', 'Diaper', 'Mood', 'Health'].map(item => (
          <TouchableOpacity
            key={item}
            style={styles.suggestionButton}
            onPress={() => handleSendPrompt(item)}
          >
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
            <Text testID={m.sender === 'user' ? 'user-text' : 'response-text'}>
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputForm} testID="whispr-input-form">
        <TextInput
          testID="input"
          placeholder="Ask Whispr"
          value={prompt}
          onChangeText={setPrompt}
          style={styles.input}
        />
        <Button
          testID="send-button"
          title="Send to Whispr"
          disabled={loading}
          onPress={() => handleSendPrompt()}
        />
        {loading && <Text testID="loading-spinner">Loading...</Text>}
      </View>
    </View>
  );
};

// make it non‐optional so TS knows it’s always there
WhisprScreen.__setScrollRefMock = fn => {
  scrollRefMock = fn;
};

export default WhisprScreen;

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3A5C4',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greetingText: {
    fontFamily: 'Edrosa',
    fontSize: 24,
    marginTop: 30,
    textAlign: 'center',
    color: '#000',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 20,
  },
  suggestionButton: {
    width: 111,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#E9DAFA',
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
    marginVertical: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginVertical: 5,
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  responseBubble: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
  },
  errorBubble: {
    backgroundColor: '#F8D7DA',
    alignSelf: 'flex-start',
  },
  inputForm: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B3A5C4',
    borderRadius: 25,
    width: width * 0.9,
    paddingHorizontal: 15,
    marginVertical: 15,
  },
  input: {
    flex: 1,
    fontFamily: 'Edrosa',
    fontSize: 16,
    color: '#312C38',
  },
  backButton: {
      alignSelf: 'flex-start',
      marginHorizontal: 10,
      marginBottom: 10,
     },
});