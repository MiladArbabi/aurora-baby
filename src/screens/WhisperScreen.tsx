// WhisprScreen.tsx
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';

const WhisprScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.greetingText}>Hello, I'm Whispr.</Text>

      <View testID="suggestions" style={styles.suggestions}>
        {['Sleep', 'Feeding', 'Diaper', 'Mood', 'Health'].map((item) => (
          <TouchableOpacity key={item} style={styles.suggestionButton}>
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>The Answer provided by Whispr!</Text>
      </View>

      <View style={styles.inputForm} testID="whispr-input-form">
        <TextInput style={styles.input} placeholder="Type your question..." />
        <TouchableOpacity testID="whisper-voice-btn" style={styles.voiceButton}>
          <Image source={require('../assets/whispr/WhisperVoiceIconColor')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.dictateButton}>
          <Image source={require('../assets/whispr/MicIcon')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
  messageBubble: {
    width: width * 0.85,
    minHeight: 100,
    borderRadius: 25,
    backgroundColor: '#B3A5C4',
    borderWidth: 1,
    borderColor: 'rgba(56, 0, 77, 0.25)',
    padding: 15,
    marginVertical: 10,
  },
  messageText: {
    fontFamily: 'Edrosa',
    fontSize: 15,
    color: '#000',
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
  voiceButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#5B4476',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dictateButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#5B4476',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
  },
});

export default WhisprScreen;