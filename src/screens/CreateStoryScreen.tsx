// src/screens/CreateStoryScreen.tsx
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import TopNav from '../components/common/TopNav';
import BottomNav from '../components/common/BottomNav';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { queryWhispr } from '../services/WhisprService';
import Spinner from '../components/common/Spinner';
import { saveUserStory } from '../services/UserStoriesService';
import { StoryCardData } from '../types/HarmonyFlatList';
import { string } from 'zod';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
type Props = StackScreenProps<RootStackParamList, 'CreateStory'>;

// Styled components for layout and UI
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
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.secondaryBackground};
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

const OptionButton = styled.TouchableOpacity<{ selected?: boolean }>`
  background-color: ${({ theme, selected }: { theme: DefaultTheme; selected?: boolean }) =>
    selected ? theme.colors.primary : theme.colors.tertiaryAccent};
  border-radius: 12px;
  padding: 10px 16px;
  margin-right: 10px;
`;

const OptionText = styled.Text<{ selected?: boolean }>`
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

// Main functional component
const CreateStoryScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const storyIdRef = React.useRef(`custom-${Date.now()}`);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const [showPreviewButton, setShowPreviewButton] = useState(false);
  const [storyPreview, setStoryPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [showGoToStory, setShowGoToStory] = useState(false);

  // Story configuration object
  const [storyConfig, setStoryConfig] = useState({
    concept: '',
    characters: [] as string[],
    location: '',
  });

  // All steps for the story builder
  const steps = [
  { title: 'Concept', options: ['Soothing', 'Playful', 'Sing Along', 'Magical'], key: 'concept' },
  { title: 'Characters', options: ['Birk', 'Freya', 'Nordra', 'AXO', 'Swans', 'Moss Moles', 'Custom'], key: 'characters' },
  {
    title: 'Location',
    options: [
      'Silver Nest',
      'Berry Hollow',
      'Misty Lake',
    ],
    key: 'location'
  },
];

  // Step navigation logic
  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollRef.current?.scrollTo({ x: prevStep * screenWidth, animated: true });
    }
  };

  // Single-value selection for concept/location
  const handleSelect = (stepKey: string, value: string) => {
    setStoryConfig(prev => ({
      ...prev,
      [stepKey]: value,
    }));
  };  

  const handleNext = () => {
    const next = currentStep + 1;
  
    if (next <= steps.length) {
      setCurrentStep(next);
      scrollRef.current?.scrollTo({ x: next * screenWidth, animated: true });
      setShowPreviewButton(next === steps.length); // safe toggle
    }
  }    

  const handlePreviewGeneration = async () => {
    setLoading(true);
    const prompt = 
    `Write a gentle, toddler-friendly story about 
    ${storyConfig.characters.join(' and ')} 
    in a ${storyConfig.concept.toLowerCase()} 
    adventure at ${storyConfig.location}.`;
    try {
      const fullStory = await queryWhispr(prompt);
      const firstTenWords = fullStory.split(' ').slice(0, 10).join(' ') + '...';
      setStoryPreview(firstTenWords);
      setShowGoToStory(true); 
    } catch (err) {
      setStoryPreview('Something went wrong.');
    } finally {
      setLoading(false);
      setShowPreviewButton(false);
    }
  }
  
  return (
    <Container>
      <TopNav navigation={navigation} />
      {/* Live story preview based on current config */}
      <PreviewCard>
      <PreviewText>
      {loading
        ? 'Generating story preview...'
        : storyPreview
        ? storyPreview
        : storyConfig.concept && storyConfig.characters.length && storyConfig.location
          ? `${storyConfig.characters.join(' & ')} in a ${storyConfig.concept.toLowerCase()} tale at ${storyConfig.location}.`
          : 'Choose your story parameters'}
      </PreviewText>
      </PreviewCard>

      {/* Horizontal scroll between steps */}
      <ScrollView
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        style={{ width: screenWidth }}
      >
        {/* Step 0: Concept */}
        <View style={{ width: screenWidth }}>
          <ParamBlock>
            <ParamTitle>Concept</ParamTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {steps[0].options.map(option => (
                <OptionButton
                  key={option}
                  onPress={() => handleSelect('concept', option)}
                  selected={storyConfig.concept === option}
                >
                  <OptionText selected={storyConfig.concept === option}>
                    {option}
                  </OptionText>
                </OptionButton>
              ))}
            </ScrollView>
            {storyConfig.concept && (
              <NextButton onPress={() => handleNext()}>
                <NextButtonText>Next</NextButtonText>
              </NextButton>
            )}
          </ParamBlock>
        </View>

        {/* Step 1: Characters (max 2) */}
        <View style={{ width: screenWidth }}>
          <ParamBlock>
            <ParamTitle>Characters</ParamTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {steps[1].options.map(option => (
                <OptionButton
                  key={option}
                  disabled={
                    !storyConfig.characters.includes(option) && storyConfig.characters.length >= 2
                  }
                  onPress={() => {
                    setStoryConfig(prev => {
                      const alreadySelected = prev.characters.includes(option);
                      if (alreadySelected) {
                        return {
                          ...prev,
                          characters: prev.characters.filter(c => c !== option),
                        };
                      } else if (prev.characters.length < 2) {
                        return {
                          ...prev,
                          characters: [...prev.characters, option],
                        };
                      } else {
                        return prev; // Do nothing if already 2 selected
                      }
                    });
                  }}
                  selected={storyConfig.characters.includes(option)}
                >
                  <OptionText selected={storyConfig.characters.includes(option)}>
                    {option}
                  </OptionText>
                </OptionButton>
              ))}
            </ScrollView>
            {storyConfig.characters.length > 0 && (
              <NextButton onPress={handleNext}>
                <NextButtonText>Next</NextButtonText>
              </NextButton>
            )}
          </ParamBlock>
        </View>
        
        {/* Step 2: Location */}
        <View style={{ width: screenWidth }}>
          <ParamBlock>
            <ParamTitle>Location</ParamTitle>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {steps[2].options.map(option => (
                <OptionButton
                  key={option}
                  onPress={() => handleSelect('location', option)}
                  selected={storyConfig.location === option}
                >
                  <OptionText selected={storyConfig.location === option}>
                    {option}
                  </OptionText>
                </OptionButton>
              ))}
            </ScrollView>
            {storyConfig.location && (
              <NextButton onPress={handleNext}>
                <NextButtonText>Next</NextButtonText>
              </NextButton>
            )}
          </ParamBlock>
        </View>
        {/* Step 3: Preview */}
        {(showPreviewButton || showGoToStory) && (
        <View style={{ width: screenWidth, alignItems: 'center' }}>
          {loading ? (
            <Spinner size={75} />
          ) : showGoToStory ? (
            <TouchableOpacity
              onPress={() => navigation.navigate('PlayStory', { storyId: storyIdRef.current })}
              style={{
                alignSelf: 'center',
                marginTop: 24,
                padding: 12,
                backgroundColor: theme.colors.muted,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                Go to My Story
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handlePreviewGeneration}
              style={{
                alignSelf: 'center',
                marginTop: 24,
                padding: 12,
                backgroundColor: theme.colors.muted,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: 'black', fontWeight: '600', fontSize: 16 }}>
                Preview My Story
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      </ScrollView>
      {/* Back navigation */}
      <BackButton onPress={handleBack}>
        <Text style={{ color: theme.colors.primary }}>← Back</Text>
      </BackButton>
      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </Container>
  );
};

export default CreateStoryScreen;
