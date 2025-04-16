// src/tests/services/QuickLogAccess.test.ts
import * as storage from '../../../src/storage/QuickLogStorage';
import { QuickLogEntry } from '../../../src/models/QuickLogSchema';
import {
    getLogsByType,
    getLogsGroupedByDate,
    getLatestLog,
    getLogsBetween,
  } from '../../../src/services/QuickLogAccess';

jest.mock('../../../src/storage/QuickLogStorage');

const mockData: QuickLogEntry[] = [
  { id: '1', babyId: 'baby-1', timestamp: '2025-04-15T08:00:00Z', type: 'sleep', version: 1, data: { start: '2025-04-15T08:00:00Z', end: '2025-04-15T10:00:00Z', duration: 120 } },
  { id: '2', babyId: 'baby-1', timestamp: '2025-04-15T11:00:00Z', type: 'feeding', version: 1, data: { method: 'bottle', quantity: 90 } },
  { id: '3', babyId: 'baby-1', timestamp: '2025-04-15T13:00:00Z', type: 'sleep', version: 1, data: { start: '2025-04-15T13:00:00Z', end: '2025-04-15T14:00:00Z', duration: 60 } }
];

const mockEntries: QuickLogEntry[] = [
    {
      id: '1',
      babyId: 'baby-001',
      timestamp: '2025-04-15T10:00:00Z',
      type: 'sleep',
      version: 1,
      data: { start: '2025-04-15T09:00:00Z', end: '2025-04-15T10:00:00Z', duration: 60 }
    },
    {
      id: '2',
      babyId: 'baby-001',
      timestamp: '2025-04-16T12:00:00Z',
      type: 'feeding',
      version: 1,
      data: { method: 'bottle', quantity: 90 }
    },
    {
      id: '3',
      babyId: 'baby-001',
      timestamp: '2025-04-17T14:00:00Z',
      type: 'mood',
      version: 1,
      data: { emoji: '🙂' }
    }
  ];

  jest.spyOn(storage, 'getAllQuickLogEntries').mockResolvedValue(mockEntries);


describe('QuickLogAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (storage.getAllQuickLogEntries as jest.Mock).mockResolvedValue(mockData);
  });

  it('filters logs by type', async () => {
    const result = await getLogsByType('sleep');
    expect(result.length).toBe(2);
    expect(result.every((e) => e.type === 'sleep')).toBe(true);
  });

  it('groups logs by calendar date', async () => {
    const mockLogs = [
      {
        id: '1',
        babyId: 'baby-001',
        timestamp: '2025-04-15T09:30:00Z',
        type: 'sleep',
        version: 1,
        data: {
          start: '2025-04-15T08:00:00Z',
          end: '2025-04-15T09:00:00Z',
          duration: 60
        }
      },
      {
        id: '2',
        babyId: 'baby-001',
        timestamp: '2025-04-15T18:30:00Z',
        type: 'feeding',
        version: 1,
        data: {
          method: 'bottle',
          quantity: 100
        }
      },
      {
        id: '3',
        babyId: 'baby-001',
        timestamp: '2025-04-14T21:00:00Z',
        type: 'mood',
        version: 1,
        data: {
          emoji: '🙂'
        }
      }
    ];

    jest.spyOn(require('../../../src/storage/QuickLogStorage'), 'getAllQuickLogEntries')
      .mockResolvedValue(mockLogs);

    const grouped = await getLogsGroupedByDate();

    expect(Object.keys(grouped)).toEqual(['2025-04-15', '2025-04-14']);
    expect(grouped['2025-04-15']).toHaveLength(2);
    expect(grouped['2025-04-14']).toHaveLength(1);
  });

  it('returns the latest log of a given type', async () => {
    const now = new Date().toISOString();
    const earlier = new Date(Date.now() - 3600 * 1000).toISOString(); // 1h earlier
  
    const logs = [
      { id: '1', type: 'sleep', timestamp: earlier, babyId: 'baby-1', version: 1, data: { start: earlier, end: now, duration: 60 }},
      { id: '2', type: 'sleep', timestamp: now, babyId: 'baby-1', version: 1, data: { start: now, end: now, duration: 60 }},
    ];
  
    jest.spyOn(require('../../storage/QuickLogStorage'), 'getAllQuickLogEntries').mockResolvedValue(logs);
  
    const latest = await getLatestLog('sleep');
  
    expect(latest?.id).toBe('2');
  });

  it('filters logs between two timestamps', async () => {
    const start = '2025-04-16T00:00:00Z';
    const end = '2025-04-17T00:00:00Z';
  
    jest
      .spyOn(storage, 'getAllQuickLogEntries')
      .mockResolvedValue(mockEntries);
  
    const result = await getLogsBetween(start, end);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});