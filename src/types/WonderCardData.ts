// src/types/WonderCard.ts
import React from 'react'
import { View, Text } from 'react-native'

export interface WonderCardData {
  id: string
  title: string
  thumbnail: string
  duration?: number
  moodTags?: string[]
  features?: string[]
  ctaLabel?: string
  cardColor?: string
}


  