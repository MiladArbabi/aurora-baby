import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveQuickLogEntry,
  getAllQuickLogEntries,
  clearQuickLogEntries,
} from '../../storage/QuickLogStorage';
import { QuickLogEntry } from '../../models/QuickLogSchema';

jest.mock('@react-native-async-storage/async-storage');

const sampleEntry: QuickLogEntry = {
  id: 'log-1',
  babyId: 'baby-123',
  timestamp: '2025-04-15T22:00:00Z',
  type: 'sleep',
  version: 1,
  data: {
    start: '2025-04-15T20:00:00Z',
    end: '2025-04-15T22:00:00Z',
    duration: 120,
  },
};

describe('QuickLogStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('saves a QuickLog entry to AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify([]));
    (AsyncStorage.setItem as jest.Mock).mockResolvedValueOnce(undefined);

    await saveQuickLogEntry(sampleEntry);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      '@quicklog_entries',
      JSON.stringify([sampleEntry])
    );
  });

  it('loads all QuickLog entries from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([sampleEntry])
    );

    const entries = await getAllQuickLogEntries();
    expect(entries).toEqual([sampleEntry]);
  });

  it('returns empty array when no data exists', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const entries = await getAllQuickLogEntries();
    expect(entries).toEqual([]);
  });

  it('throws error if data in storage is invalid', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('[{ invalid: true }]');

    await expect(getAllQuickLogEntries()).rejects.toThrow();
  });

  it('clears all QuickLog entries from AsyncStorage', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValueOnce(undefined);

    await clearQuickLogEntries();

    expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@quicklog_entries');
  });
});
