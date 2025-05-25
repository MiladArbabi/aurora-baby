// src/utils/storyPagination.ts

import { prebuiltStoryPages } from '../data/prebuiltStoryPages';
import { StoryPage } from '../data/prebuiltStoryPages';

// default character limit per page
const DEFAULT_CHAR_LIMIT = 300;

/**
 * Split story text into pages, breaking on sentence boundaries,
 * with a fallback to manual prebuilt pages if available.
 */
export function paginateStory(
  fullStory: string,
  storyId: string,
  charLimit: number = DEFAULT_CHAR_LIMIT
): StoryPage[] {
  // 1) Manual override
  const manual = prebuiltStoryPages[storyId];
  if (manual) return manual;

  // 2) Normalize and early return
  const text = fullStory.trim().replace(/\s+/g, ' ');
  if (!text) return [];

  // 3) Break into sentences
  const sentences = text
    .split(/([.?!])\s+/)
    .reduce<string[]>((acc, piece, i, arr) => {
      if (/[.?!]/.test(piece) && i < arr.length - 1) {
        acc[acc.length - 1] += piece + ' ';
      } else {
        acc.push(piece);
      }
      return acc;
    }, []);

  // 4) Pack into pages
  const pagesText: string[] = [];
  let buffer = '';
  sentences.forEach(s => {
    if (buffer.length + s.length > charLimit) {
      pagesText.push(buffer.trim());
      buffer = s;
    } else {
      buffer += s;
    }
  });
  if (buffer.trim()) pagesText.push(buffer.trim());

  // 5) Map to StoryPage[]
  return pagesText.map(text => ({ text }));
}
