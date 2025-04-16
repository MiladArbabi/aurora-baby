// src/tests/services/SpectMapper.test.ts
import { categorizeLogToSPECT } from '../../../src/services/SpectMapper';
import { QuickLogEntry } from '../../../src/models/QuickLogSchema';

const sample = (
    type: QuickLogEntry['type'],
    timestamp: string,
    data: any = {}
  ): QuickLogEntry => {
    return {
      id: 'log-1',
      babyId: 'baby-001',
      timestamp,
      type: type as QuickLogEntry['type'],
      version: 1,
      data
    };
  };

describe('SpectMapper', () => {
  it('maps sleep logs to SLEEP with subcategorycategory nap/night', () => {
    const nightLog = sample('sleep', '2025-04-15T22:30:00Z');
    const nap1 = sample('sleep', '2025-04-15T10:00:00Z');
    const nap2 = sample('sleep', '2025-04-15T13:00:00Z');
    const nap3 = sample('sleep', '2025-04-15T16:30:00Z');

    expect(categorizeLogToSPECT(nightLog)).toEqual({ category: 'Sleep', subcategory: 'night' });
    expect(categorizeLogToSPECT(nap1)).toEqual({ category: 'Sleep', subcategory: 'nap1' });
    expect(categorizeLogToSPECT(nap2)).toEqual({ category: 'Sleep', subcategory: 'nap2' });
    expect(categorizeLogToSPECT(nap3)).toEqual({ category: 'Sleep', subcategory: 'nap3' });
  });

  it('maps awake logs to SLEEP with subcategory wake_morning or wake_other', () => {
    const morning = sample('awake', '2025-04-15T07:00:00Z');
    const later = sample('awake', '2025-04-15T11:00:00Z');

    expect(categorizeLogToSPECT(morning)).toEqual({ category: 'Sleep', subcategory: 'wake_morning' });
    expect(categorizeLogToSPECT(later)).toEqual({ category: 'Sleep', subcategory: 'wake_other' });
  });

  it('maps feeding logs to EAT with method-based subcategorycategory', () => {
    const bottle = sample('feeding', '2025-04-15T08:00:00Z', { method: 'bottle' });
    const solid = sample('feeding', '2025-04-15T09:00:00Z', { method: 'solid' });

    expect(categorizeLogToSPECT(bottle)).toEqual({ category: 'Eat', subcategory: 'bottle' });
    expect(categorizeLogToSPECT(solid)).toEqual({ category: 'Eat', subcategory: 'solid' });
  });

  it('maps diaper logs to CARE', () => {
    const diaper = sample('diaper', '2025-04-15T10:00:00Z', { status: 'wet' });
    expect(categorizeLogToSPECT(diaper)).toEqual({ category: 'Care', subcategory: 'wet' });
  });

  it('maps mood logs to CARE', () => {
    const mood = sample('mood', '2025-04-15T10:00:00Z', { emoji: '🙂' });
    expect(categorizeLogToSPECT(mood)).toEqual({ category: 'Care', subcategory: '🙂' });
  });

  it('maps note logs to TALK', () => {
    const note = sample('note', '2025-04-15T10:00:00Z', { text: 'Baby babbled' });
    expect(categorizeLogToSPECT(note)).toEqual({ category: 'Talk', subcategory: 'note' });
  });

  it('returns null for unsupported or unknown types', () => {
    const unknown = {
      id: 'log-unknown',
      babyId: 'baby-001',
      timestamp: '2025-04-15T10:00:00Z',
      type: 'unknown', // not a valid QuickLogEntry['type']
      version: 1,
      data: {}
    } as unknown as QuickLogEntry; // <- this cast is intentional

    expect(categorizeLogToSPECT(unknown)).toBeNull();
  });
});