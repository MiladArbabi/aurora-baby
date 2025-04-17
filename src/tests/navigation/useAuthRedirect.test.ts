import { renderHook } from '@testing-library/react-hooks';
import { useAuthRedirect } from '../../navigation/useAuthRedirect';
import * as LastScreenTracker from '../../services/LastScreenTracker';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { NavigationProp } from '@react-navigation/native';

jest.mock('../../services/LastScreenTracker');

const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

describe('useAuthRedirect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to last screen if user exists and loading is false', async () => {
    (LastScreenTracker.getLastScreen as jest.Mock).mockResolvedValue('Care');

    renderHook(() => useAuthRedirect({ uid: '123' }, false), {
      wrapper: ({ children }) => <NavigationContainer>{children}</NavigationContainer>,
    });

    // Let the Promise in getLastScreen() resolve
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(LastScreenTracker.getLastScreen).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('Care');
  });

  it('navigates to Home if no last screen found', async () => {
    (LastScreenTracker.getLastScreen as jest.Mock).mockResolvedValue(null);

    renderHook(() => useAuthRedirect({ uid: '123' }, false), {
      wrapper: ({ children }) => <NavigationContainer>{children}</NavigationContainer>,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockNavigate).toHaveBeenCalledWith('Home');
  });

  it('does not navigate if still loading or user is null', async () => {
    renderHook(() => useAuthRedirect(null, true), {
      wrapper: ({ children }) => <NavigationContainer>{children}</NavigationContainer>,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
