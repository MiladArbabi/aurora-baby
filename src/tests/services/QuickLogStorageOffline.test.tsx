import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  queueLogOffline,
  getOfflineQueue,
  clearOfflineQueue,
  syncQueuedLogs,
} from '../../storage/QuickLogStorage';

describe('Offline Log Queueing', () => {
    const sampleLog = {
        id: '1',
        babyId: 'test-baby',
        version: 1,
        type: 'sleep' as const,
        timestamp: new Date().toISOString(),
        data: {
          start:    new Date().toISOString(),
          end:      new Date(Date.now() + 20 * 60 * 1000).toISOString(),
          duration: 20,
        },
      };

  beforeEach(async () => {
    jest.clearAllMocks();
    await clearOfflineQueue();
  });

  it('stores logs when offline', async () => {
    await queueLogOffline(sampleLog);
    const stored = await getOfflineQueue();
    expect(stored).toEqual([sampleLog]);
  });

  it('replays queued logs on reconnect', async () => {
    const log1 = {
        id: '1',
        babyId: 'test-baby',
        version: 1,
        type: 'sleep' as const,
        timestamp: new Date().toISOString(),
        data: {
          start:    new Date().toISOString(),
          end:      new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          duration: 15,
        },
      };
      const log2 = {
        id: '2',
        babyId: 'test-baby',
        version: 1,
        type: 'sleep' as const,
        timestamp: new Date().toISOString(),
        data: {
          start:    new Date().toISOString(),
          end:      new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          duration: 30,
        },
      };

    await queueLogOffline(log1);
    await queueLogOffline(log2);

    const sendMock = jest.fn(async (log: any) => Promise.resolve());
    await syncQueuedLogs(sendMock);

    expect(sendMock).toHaveBeenCalledTimes(2);
    expect(sendMock).toHaveBeenNthCalledWith(1, log1);
    expect(sendMock).toHaveBeenNthCalledWith(2, log2);

    const afterSync = await getOfflineQueue();
    expect(afterSync).toEqual([]);
  });
});
