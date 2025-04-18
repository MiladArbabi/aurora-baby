import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthRedirect } from '../../navigation/useAuthRedirect';
import * as LastScreenTracker from '../../services/LastScreenTracker';

const mockNavigate = jest.fn();

// mock the navigation hook to return our fake navigate
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: mockNavigate }),
  };
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>{children}</NavigationContainer>
);

describe('useAuthRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to last screen if user exists and loading is false', async () => {
    // spyOn the service and mock its resolution
    jest.spyOn(LastScreenTracker, 'getLastScreen').mockResolvedValue('Care');
    renderHook(() => useAuthRedirect({ uid: '123' }, false), { wrapper });
    // wait for the promise to resolve inside the hook
    await new Promise((r) => setTimeout(r, 50));
    expect(mockNavigate).toHaveBeenCalledWith('Care');
  });

  it('navigates to Home if no last screen found', async () => {
    jest.spyOn(LastScreenTracker, 'getLastScreen').mockResolvedValue(null);
    renderHook(() => useAuthRedirect({ uid: '123' }, false), { wrapper });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('does not navigate if still loading or no user', async () => {
    renderHook(() => useAuthRedirect(null, true), { wrapper });
    await new Promise((r) => setTimeout(r, 50));
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});