// src/context/RegionContext.tsx
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { RegionMap, RegionMeta } from '../data/RegionMapSchema';
import { categorizeLogToSPECT } from '../services/SpectMapper';
import type { QuickLogEntry } from '../models/QuickLogSchema';

/** What each region’s UI needs */
export interface RegionStateItem {
  unlocked: boolean;
  bloomLevel: number;
}
export type RegionState = Record<string, RegionStateItem>;

/** Initial all‐locked, zero bloom state */
export const initialRegionState: RegionState = 
Object.keys(RegionMap).reduce(
  (acc, key) => ({
    ...acc,
    [key]: { unlocked: false, bloomLevel: 0 },
  }),
  {} as RegionState
);

export type Action =
  | { type: 'LOG_RECEIVED'; log: QuickLogEntry }
  | { type: 'RESET' };

  /** Reducer driving RegionState from `LOG_RECEIVED` and `RESET` actions */
  export function regionReducer(
    state: RegionState, action: Action): 
    RegionState {  
    switch (action.type) {
    case 'LOG_RECEIVED': {
      const spect = categorizeLogToSPECT(action.log);
      if (!spect) return state;
      const next = { ...state };
      // For each region that watches this spect category, bump bloom & unlock
      Object.entries(RegionMap).forEach(([key, meta]) => {
        if (meta.spectTags.includes(spect.category.toUpperCase() as any)) {
          next[key] = {
            unlocked: true,
            bloomLevel: Math.min(next[key].bloomLevel + 1, 5),
          };
        }
      });
      return next;
    }
    case 'RESET':
      return initialRegionState;
    default:
      return state;
  }
}

const RegionContext = createContext<{ state: RegionState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const RegionProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(regionReducer, initialRegionState);

  // TODO: subscribe to live QuickLogEntry stream & dispatch LOG_RECEIVED
  // For now, stub a no-op or hook into your existing data store

  useEffect(() => {
    // e.g. subscribe to real-time logs, then:
    // logs$.subscribe(log => dispatch({ type: 'LOG_RECEIVED', log }));
  }, []);

  return <RegionContext.Provider value={{ state, dispatch }}>{children}</RegionContext.Provider>;
};

/** Hook for screens/components to read region state */
export const useRegionState = (): RegionState => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegionState must be inside a RegionProvider');
  return ctx.state;
};

/** Hook for screens/components to send log events into the globe model */
export const useRegionDispatch = (): React.Dispatch<
  | { type: 'LOG_RECEIVED'; log: import('../models/QuickLogSchema').QuickLogEntry }
  | { type: 'RESET' }
> => {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegionDispatch must be inside a RegionProvider');
  return ctx.dispatch;
};