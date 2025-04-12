import { useEffect } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from './AppNavigator';

export const useAuthRedirect = (user: any, loading: boolean) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    if (!loading && user) {
      navigation.navigate('Home');
    }
  }, [user, loading, navigation]);
};