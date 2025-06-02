// src/navigation/useAuthRedirect.ts
import { useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator';
import { getLastScreen } from '../services/LastScreenTracker';

export const useAuthRedirect = (user: any, loading: boolean) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!loading && user) {
      getLastScreen().then((lastScreen) => {
        // fallback to 'Home' if none saved
        const screenName = (lastScreen ?? 'Home') as unknown as keyof RootStackParamList;
        // cast to any so TypeScript won't complain about literal union mismatch
        navigation.navigate(screenName as any);
      });
    }
  }, [user, loading, navigation]);
};