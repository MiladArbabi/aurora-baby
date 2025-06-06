import * as Access from '../storage/BabyProfileAccess'
import { BabyProfile } from '../models/BabyProfile'
import AsyncStorage from '@react-native-async-storage/async-storage'

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}))

const mockProfile: BabyProfile = {
  id: 'b1',
  name: 'Luna',
  birthDate: '2023-06-01',
  sleepType: 'regular',
  createdAt: '2025-06-01T00:00:00Z',
}

describe('BabyProfileAccess', () => {
  it('saves and loads profile', async () => {
    await Access.saveBabyProfile(mockProfile)
    expect(AsyncStorage.setItem).toHaveBeenCalled()

    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockProfile))
    const result = await Access.getBabyProfile()
    expect(result?.name).toBe('Luna')
  })
})
