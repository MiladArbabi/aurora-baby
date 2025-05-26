// src/tests/contexts/RegionContext.test.ts
import { regionReducer, initialRegionState, RegionState } from '../../../src/context/RegionContext';
import { RegionMap } from '../../data/RegionMapSchema';
import type { QuickLogEntry } from '../../models/QuickLogSchema';

// 1) Stub a QuickLog that maps to the first region’s spectTag
const firstRegionKey = Object.keys(RegionMap)[0];
const firstRegionMeta = RegionMap[firstRegionKey];
const dummyLog = {
  id: '1',
  babyId: 'b',
  timestamp: new Date().toISOString(),
  type: firstRegionMeta.spectTags[0].toLowerCase(),
  version: 1,
  data: {},
} as QuickLogEntry;

describe('regionReducer', () => {
  it('returns initial state when RESET', () => {
    const next = regionReducer({} as RegionState, { type: 'RESET' });
    expect(next).toEqual(initialRegionState);
  });

  it('unlocks and increments bloom on LOG_RECEIVED', () => {
    const prev = initialRegionState;
    const next = regionReducer(prev, { type: 'LOG_RECEIVED', log: dummyLog });
    // that region should be unlocked & bloomLevel = 1
    expect(next[firstRegionKey].unlocked).toBe(true);
    expect(next[firstRegionKey].bloomLevel).toBe(1);
    // others remain unchanged
    Object.keys(next).forEach(key => {
      if (key !== firstRegionKey) {
        expect(next[key]).toEqual(prev[key]);
      }
    });
  });
});
