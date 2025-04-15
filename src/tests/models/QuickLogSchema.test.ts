// src/tests/models/QuickLogSchema.test.ts

import { QuickLogEntry } from '../../../src/models/QuickLogSchema';

describe('QuickLogEntry schema', () => {
  it('validates a sample SleepLog entry', () => {
    const entry: QuickLogEntry = {
      id: 'uuid-1234',
      babyId: 'baby-001',
      timestamp: new Date().toISOString(),
      type: 'sleep',
      version: 1,
      data: {
        start: '2024-04-13T22:00:00Z',
        end: '2024-04-14T06:00:00Z',
        duration: 480,
      },
    };

    expect(entry.type).toBe('sleep');
    expect(entry.data.duration).toBeGreaterThan(0);
  });
});
