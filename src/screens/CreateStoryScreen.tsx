// src/screens/CreateStoryScreen.tsx
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import TopNav from '../components/common/TopNav';
import BottomNav from '../components/common/BottomNav';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { queryWhispr } from '../services/WhisprService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'CreateStory'>;

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const PreviewCard = styled.View`
  width: ${screenWidth * 0.9}px;
  height: ${screenHeight * 0.4}px;
  align-self: center;
  margin-top: 42px;
  margin-bottom: 24px;
  border-radius: 24px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.darkAccent};
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  justify-content: center;
  align-items: center;
`;

const PreviewText = styled.Text`
  font-size: 20px;
  font-weight: 600;
  color: white;
  text-align: center;
`;

const ParamBlock = styled.View`
  padding: 20px;
  align-items: flex-start;
`;

const ParamTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`;

const OptionButton = styled.TouchableOpacity`
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.tertiaryAccent};
  border-radius: 12px;
  padding: 10px 16px;
  margin-right: 10px;
`;

const OptionText = styled.Text`
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
  font-size: 14px;
`;

const NextButton = styled.TouchableOpacity`
  margin-top: 24px;
  align-self: center;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.muted};
  padding: 10px 24px;
  border-radius: 12px;
`;

const NextButtonText = styled.Text`
  color: white;
  font-weight: bold;
  font-size: 16px;
`;

const BackButton = styled.TouchableOpacity`
  margin-left: 20px;
  margin-bottom: 10px;
`;

const CreateStoryScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [storyPreview, setStoryPreview] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [storyConfig, setStoryConfig] = useState({
    concept: '',
    characters: [] as string[],
    language: '',
    mode: '',
  });

  const steps = [
    { title: 'Concept', options: ['Soothing', 'Playful', 'Sing Along', 'Magical'], key: 'concept' },
    { title: 'Characters', options: ['Birk', 'Freya', 'Nordra', 'AXO', 'Swans', 'Moss Moles', 'Custom'], key: 'characters' },
    { title: 'Language', options: ['English', 'Swedish', 'Spanish'], key: 'language' },
    { title: 'Mode', options: ['Voice', 'Text', 'Animation'], key: 'mode' },
  ];

  const handleSelect = (stepKey: string, value: string) => {
    setStoryConfig(prev => {
      if (stepKey === 'characters') {
        const alreadySelected = prev.characters.includes(value);
        return {
          ...prev,
          characters: alreadySelected
            ? prev.characters.filter(c => c !== value)
            : [...prev.characters, value],
        };
      }
      return { ...prev, [stepKey]: value };
    });
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollRef.current?.scrollTo({ x: nextStep * screenWidth, animated: true });
    } else {
      // Final step: trigger story preview
      generateStoryPreview();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollRef.current?.scrollTo({ x: prevStep * screenWidth, animated: true });
    }
  };

  const generateStoryPreview = async () => {
    setLoadingPreview(true);
    try {
      const prompt = `Create a short ${storyConfig.mode.toLowerCase()} story in ${storyConfig.language} with a ${storyConfig.concept.toLowerCase()} tone featuring ${storyConfig.characters.join(', ')}. Keep it suitable for toddlers.`;
      const result = await queryWhispr(prompt);
      setStoryPreview(result);
    } catch (error) {
      setStoryPreview('Sorry, something went wrong.');
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <Container>
      <TopNav navigation={navigation} />

      <PreviewCard>
        <PreviewText>
          {loadingPreview
            ? 'Generating preview...'
            : storyPreview
              ? storyPreview
              : `${storyConfig.concept || 'Pick a concept'}${storyConfig.characters.length ? ` with ${storyConfig.characters.join(', ')}` : ''}${storyConfig.language ? ` in ${storyConfig.language}` : ''}${storyConfig.mode ? ` as ${storyConfig.mode}` : ''}`}
        </PreviewText>
      </PreviewCard>

      <BackButton onPress={handleBack}>
        <Text style={{ color: theme.colors.primary }}>← Back</Text>
      </BackButton>

      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        style={{ width: screenWidth }}
      >
        {steps.map(step => (
          <View key={step.key} style={{ width: screenWidth }}>
            <ParamBlock>
              <ParamTitle>{step.title}</ParamTitle>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {step.options.map(option => (
                  <OptionButton key={option} onPress={() => handleSelect(step.key, option)}>
                    <OptionText>{option}</OptionText>
                  </OptionButton>
                ))}
              </ScrollView>
              <NextButton onPress={handleNext}>
                <NextButtonText>Next</NextButtonText>
              </NextButton>
            </ParamBlock>
          </View>
        ))}
      </ScrollView>

      {storyPreview !== '' && !loadingPreview && (
      <TouchableOpacity
        onPress={() => console.log('Final story generation and navigation here')}
        style={{
          alignSelf: 'center',
          marginVertical: 20,
          padding: 12,
          backgroundColor: theme.colors.primary,
          borderRadius: 16,
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Generate My Story
        </Text>
      </TouchableOpacity>
    )}

      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </Container>
  );
};

export default CreateStoryScreen;
