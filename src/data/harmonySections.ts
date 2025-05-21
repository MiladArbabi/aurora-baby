// src/data/harmonySections.ts
import { HarmonySection } from "types/HarmonyFlatList"
import { prebuiltStoryContents } from "./prebuiltStoryContents";

export const harmonySections: HarmonySection[] = [
  {
    id: 'play-a-story',
    title: '📖 Play a Story',
    type: 'play',
    data: [
      {
        id: 'birk-forest-journey',
        title: 'Birk’s Forest Journey',
        duration: 4,
        moodTags: ['adventure', 'calming'],
        thumbnail: 'https://cdn.aurora-baby.com/stories/birk.png',
        type: 'prebuilt',
        ctaLabel: 'Play',
        badges: ['New'],
        cardColor: 'lavender',
        fullStory: prebuiltStoryContents['birk-forest-journey'],
      },
      {
        id: 'freya-sings',
        title: 'Freya Sings to the Stars',
        duration: 3,
        moodTags: ['gentle', 'musical'],
        thumbnail: 'https://cdn.aurora-baby.com/stories/freya.png',
        type: 'prebuilt',
        ctaLabel: 'Play',
        badges: ['Popular'],
        cardColor: 'lavender',
        fullStory: prebuiltStoryContents['freya-sings'],
      },
      {
        id: 'nordra-arrives',
        title: 'Nordra’s Ride',
        duration: 5,
        moodTags: ['journey', 'wonder'],
        thumbnail: 'local://nordra_arrives.png',
        type: 'prebuilt',
        ctaLabel: 'Play',
        badges: ['Adventure'],
        cardColor: 'lavender',
        fullStory: prebuiltStoryContents['nordra-arrives'],
      },
    ],
  },
  {
    id: 'create-a-story',
    title: '✍️ Create a Story',
    type: 'create',
    data: [
      {
        id: 'blank-template',
        title: 'Start from Scratch',
        description: 'Use your voice or text to begin.',
        thumbnail: 'local://create_blank.png',
        type: 'template',
        ctaLabel: 'Create',
        cardColor: 'teal'
      },
      {
        id: 'prompt-bedtime',
        title: 'Sleepy Forest Adventure',
        description: 'A soothing journey with Freya.',
        thumbnail: 'local://prompt_forest.png',
        type: 'prompt',
        ctaLabel: 'Start',
        cardColor: 'teal'
      },
      {
        id: 'story-builder-bubbles',
        title: 'Bubble Story Maker',
        description: 'Build a tale with drag-and-drop scenes.',
        thumbnail: 'local://story_bubble.png',
        type: 'generated',
        ctaLabel: 'Build',
        cardColor: 'teal'
      },
      {
        id: 'ai-guide',
        title: 'Let AI Guide the Tale',
        description: 'Tell us a mood, and we’ll take it from there!',
        thumbnail: 'local://ai_prompt.png',
        type: 'generated',
        ctaLabel: 'Generate',
        cardColor: 'teal'
      },
    ],
  },
  {
    id: 'personalized-stories',
    title: '🧠 Just for Your Baby',
    subtitle: 'Based on recent sleep and mood',
    type: 'personalized',
    data: [
      {
        id: 'freya-dreams',
        title: 'Freya’s Dreamy Glide',
        duration: 3,
        moodTags: ['sleepy', 'calm'],
        thumbnail: 'local://dreamy_freya.png',
        type: 'personalized',
        ctaLabel: 'Play',
        babyNameTag: 'For Freya',
        badges: ['Tailored'],
        cardColor: 'peach'
      },
      {
        id: 'birk-slumber',
        title: 'Birk’s Cozy Nap',
        duration: 4,
        moodTags: ['sleepy'],
        thumbnail: 'local://cozy_birk.png',
        type: 'personalized',
        ctaLabel: 'Play',
        babyNameTag: 'For Freya',
        cardColor: 'peach'
      },
      {
        id: 'stars-overhead',
        title: 'Stars Overhead',
        duration: 2,
        moodTags: ['gentle', 'sleepy'],
        thumbnail: 'local://stars_overhead.png',
        type: 'personalized',
        ctaLabel: 'Play',
        babyNameTag: 'For Freya',
        cardColor: 'peach'
      },
      {
        id: 'morning-magic',
        title: 'Morning Magic with AXO',
        duration: 3,
        moodTags: ['happy', 'awake'],
        thumbnail: 'local://axo_morning.png',
        type: 'personalized',
        ctaLabel: 'Play',
        babyNameTag: 'For Freya',
        cardColor: 'peach',
        badges: ['New'],
      },
    ],
  },
  {
    id: 'category-bedtime',
    title: '🌙 Bedtime Forests',
    type: 'category',
    data: [
      {
        id: 'moss-song',
        title: 'The Moss Moles’ Song',
        duration: 2,
        moodTags: ['bedtime', 'gentle'],
        thumbnail: 'local://moss_moles.png',
        type: 'prebuilt',
        ctaLabel: 'Play',
        cardColor: 'lavender'
      },
      {
        id: 'glowing-cave',
        title: 'The Glowing Cave',
        duration: 3,
        moodTags: ['bedtime', 'soft adventure'],
        thumbnail: 'local://glowing_cave.png',
        type: 'prebuilt',
        ctaLabel: 'Play',
        cardColor: 'lavender'
      },
      {
        id: 'northern-lullaby',
        title: 'Northern Lullaby',
        duration: 3,
        moodTags: ['musical', 'dreamy'],
        thumbnail: 'local://northern_lullaby.png',
        type: 'prebuilt',
        ctaLabel: 'Play',
        cardColor: 'lavender'
      },
    ],
  },
];
