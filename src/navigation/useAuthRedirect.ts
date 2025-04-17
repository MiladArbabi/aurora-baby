import { useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator';
import { getLastScreen } from '../services/LastScreenTracker';


export const useAuthRedirect = (user: any, loading: boolean) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!loading && user) {
      getLastScreen().then((lastScreen) => {
        const screenName = (lastScreen || 'Home') as keyof RootStackParamList;
        navigation.navigate(screenName);
      });
    }
  }, [user, loading, navigation]);
};