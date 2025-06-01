// src/models/content.ts
export type ContentSource = 'prebuilt' | 'ai';

export interface ContentItem {
  id: string;
  type: 'story' | 'music' | 'ar_game' | 'vr_tour' | 'quiz';
  source: ContentSource;
  region: string;
  title: string;
  duration: number | null; // in minutes, null if unknown
  lastAccessed?: string; // ISO date, optional
}
