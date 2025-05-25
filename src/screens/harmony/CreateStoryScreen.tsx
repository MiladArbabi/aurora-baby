// src/screens/harmony/CreateStoryScreen.tsx
import React, { useRef, useState, useCallback } from 'react';
import { Dimensions, ScrollView, TouchableOpacity, View, Text } from 'react-native';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import TopNav from '../../components/common/TopNav';
import BottomNav from '../../components/common/BottomNav';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import Spinner from '../../components/common/Spinner';
import { generateOrGetStory } from '../../services/StoryGenerationService';
import { StoryCardData } from '../../types/HarmonyFlatList';
import { logEvent } from '../../utils/analytics';
import { isFeatureEnabled } from '../../services/RemoteConfigService';

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
  const [fullStory, setFullStory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showGoToStory, setShowGoToStory] = useState(false);
  
  const advancedTone = isFeatureEnabled('advanced_tone_selector');

  // Story configuration object
  const [storyConfig, setStoryConfig] = useState({
    length: '',
    concept: '',
    characters: [] as string[],
    location: '',
  });

  // All steps for the story builder
  const steps = [
        { title: 'Length', options: ['Short', 'Medium', 'Long'], key: 'length' },
        // only include Tone when the flag is true
        ...(advancedTone
          ? [{ title: 'Tone', options:['Soothing','Playful','Sing Along','Magical'], key: 'concept' }]
          : []),
        { title: 'Characters', options: ['Birk', 'Freya', 'Nordra', 'AXO', 'Swans', 'Moss Moles', 'Custom'], key: 'characters' },
        { title: 'Location', options: ['Silver Nest', 'Berry Hollow', 'Misty Lake'], key: 'location' },
      ];

//States
// 1) Go back one step
const handleBack = React.useCallback(() => {
  if (currentStep > 0) {
    const prev = currentStep - 1;
    setCurrentStep(prev);
    scrollRef.current?.scrollTo({ x: prev * screenWidth, animated: true });
    setShowPreviewButton(false);
  }
}, [currentStep]);

// 2) Select a single‐value parameter (length, tone/concept, or location)
const handleSelect = React.useCallback(
  (key: 'length' | 'concept' | 'location', value: string) => {
    setStoryConfig(prev => ({ ...prev, [key]: value }));
  },
  []
);

// 3) Toggle characters (multi‐select, max 2)
const handleToggleCharacter = React.useCallback((option: string) => {
  setStoryConfig(prev => {
    const has = prev.characters.includes(option);
    if (has) {
      return { ...prev, characters: prev.characters.filter(c => c !== option) };
    }
    if (prev.characters.length < 2) {
      return { ...prev, characters: [...prev.characters, option] };
    }
    return prev;
  });
}, []);

// 4) Advance to the next step
const handleNext = React.useCallback(() => {
  const next = currentStep + 1;
  if (next <= steps.length) {
    setCurrentStep(next);
    scrollRef.current?.scrollTo({ x: next * screenWidth, animated: true });
    setShowPreviewButton(next === steps.length);
  }
}, [currentStep, steps.length]);

// 5) Generate (or fetch cached) preview from AI
const handlePreviewGeneration = React.useCallback(async () => {
  setLoading(true);
  // build prompt using all chosen params
  const prompt = `Write a ${storyConfig.length.toLowerCase()}, gentle, toddler-friendly story ` +
                 `about ${storyConfig.characters.join(' and ')} ` +
                 `in a ${storyConfig.concept.toLowerCase()} adventure at ${storyConfig.location}.`;
 
  try {
    const card = await generateOrGetStory(prompt);
    setFullStory(card.fullStory);
    setStoryPreview(card.fullStory.split(' ').slice(0, 10).join(' ') + '…');
    setShowGoToStory(true);
    storyIdRef.current = card.id;

    logEvent('story_preview_shown', { storyId: card.id });
    
  } catch (err) {
    console.error(err);
    setStoryPreview('Something went wrong.');
  } finally {
    setLoading(false);
    setShowPreviewButton(false);
  }
}, [storyConfig]);

const renderStep = React.useCallback((stepIndex: number) => {
  const { title, options, key } = steps[stepIndex] as {
    title: string;
    options: string[];
    key: 'length' | 'concept' | 'characters' | 'location';
  };
  const isMulti = key === 'characters';

  return (
    <View key={key} style={{ width: screenWidth }}>
      <ParamBlock>
        <ParamTitle>{title}</ParamTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {options.map(option => {
            const selected = isMulti
              ? storyConfig.characters.includes(option)
              : (storyConfig as any)[key] === option;
            const disabled =
              isMulti &&
              !selected &&
              storyConfig.characters.length >= 2;

            return (
              <OptionButton
                key={option}
                selected={selected}
                disabled={disabled}
                onPress={() =>
                  isMulti
                    ? handleToggleCharacter(option)
                    : handleSelect(key as any, option)
                }
              >
                <OptionText selected={selected}>
                  {option}
                </OptionText>
              </OptionButton>
            );
          })}
        </ScrollView>
        {(
          (isMulti && storyConfig.characters.length > 0) ||
          (!isMulti && !!(storyConfig as any)[key])
        ) && (
          <NextButton onPress={handleNext}>
            <NextButtonText>Next</NextButtonText>
          </NextButton>
        )}
      </ParamBlock>
    </View>
  );
}, [
  steps,
  storyConfig,
  handleSelect,
  handleToggleCharacter,
  handleNext,
]);
  
return (
  <Container>
    <TopNav navigation={navigation} />

    {/* Preview Card */}
    <PreviewCard>
      <PreviewText>
        {loading
          ? 'Generating story preview...'
          : storyPreview
          ? storyPreview
          : storyConfig.length &&
            storyConfig.concept &&
            storyConfig.characters.length > 0 &&
            storyConfig.location
          ? `${storyConfig.characters.join(' & ')} in a ${storyConfig.concept.toLowerCase()} tale at ${storyConfig.location}.`
          : 'Choose your story parameters'}
      </PreviewText>
    </PreviewCard>

    {/* Steps Scroll */}
    <ScrollView
      horizontal
      pagingEnabled
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      ref={scrollRef}
      style={{ width: screenWidth }}
    >
      {/* render each of the 4 steps */}
      {steps.map((_, idx) => renderStep(idx))}

      {/* Preview / Go to Story */}
      {(showPreviewButton || showGoToStory) && (
        <View style={{ width: screenWidth, alignItems: 'center' }}>
          {loading ? (
            <Spinner size={75} />
          ) : showGoToStory ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('PlayStory', {
                  storyId: storyIdRef.current,
                  fullStory,
                  fromPreview: true,
                })
              }
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

    {/* Back & Bottom Nav */}
    <BackButton onPress={handleBack}>
      <Text style={{ color: theme.colors.primary }}>← Back</Text>
    </BackButton>
    <BottomNav navigation={navigation} activeScreen="Harmony" />
  </Container>
)};

export default CreateStoryScreen;
