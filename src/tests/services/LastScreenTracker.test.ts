import { saveLastScreen, getLastScreen } from '../../services/LastScreenTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('LastScreenTracker', () => {
  it('saves and retrieves last screen', async () => {
    await saveLastScreen('CareScreen');
    const result = await getLastScreen();
    expect(result).toBe('CareScreen');
  });
});
