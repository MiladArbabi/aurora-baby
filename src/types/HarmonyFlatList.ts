// src/types/HarmonyFlatList.ts

export interface HarmonySection {
    id: string
    title: string
    subtitle?: string
    type: 'play' | 'create' | 'personalized' | 'category'
    data: StoryCardData[]
  }
  
  export interface StoryCardData {
    id: string
    title?: string
    description?: string
    duration?: number // in minutes
    moodTags?: string[] // ['gentle', 'sleepy', 'funny']
    thumbnail: string // URI or local asset
    type: 'prebuilt' | 'template' | 'prompt' | 'generated' | 'personalized'
    ctaLabel?: string // “Play”, “Create”, “Preview”
    action?: () => void // for click handler or deep linking
    badges?: string[] // ['New', 'Tailored', 'Trending']
    babyNameTag?: string // “For Freya” (personalization)
    cardColor?: 'lavender' | 'teal' | 'peach'
  }
  