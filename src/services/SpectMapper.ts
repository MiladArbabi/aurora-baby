// src/services/SpectMapper.ts

import { QuickLogEntry } from '../models/QuickLogSchema';

export interface SpectCategory {
  category: 'Sleep' | 'Play' | 'Eat' | 'Care' | 'Talk';
  subcategory?: string;
}

export const categorizeLogToSPECT = (log: QuickLogEntry): SpectCategory | null => {
    const time = new Date(log.timestamp).getUTCHours();
  
    switch (log.type) {
      case 'sleep': {
        if (time >= 19 || time < 6) return { category: 'Sleep', subcategory: 'night' };
        if (time < 11) return { category: 'Sleep', subcategory: 'nap1' };
        if (time < 15) return { category: 'Sleep', subcategory: 'nap2' };
        return { category: 'Sleep', subcategory: 'nap3' };
      }
  
      case 'feeding': {
        const method = log.data?.method;
        if (method === 'bottle') return { category: 'Eat', subcategory: 'bottle' };
        if (method === 'breast') return { category: 'Eat', subcategory: 'breast' };
        if (method === 'solid') return { category: 'Eat', subcategory: 'solid' };
        return { category: 'Eat' };
      }
  
      case 'diaper': {
        const status = log.data?.status;
        return { category: 'Care', subcategory: status ?? undefined };
      }
  
      case 'mood': {
        const emoji = log.data?.emoji;
        return { category: 'Care', subcategory: emoji ?? undefined };
      }
  
      case 'note':
        return { category: 'Talk', subcategory: 'note' };
  
      default:
        return null;
    }
  };