import React from 'react';
import { Dimensions, View, Text, TouchableOpacity, Animated } from 'react-native';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import TopNav from '../../components/common/TopNav';
import BottomNav from '../../components/common/BottomNav';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AuroraLogo from '../../assets/system/colorlogo'; // your SVG or PNG

type Props = StackScreenProps<RootStackParamList, 'TextStory'>;
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const PAGE_CHAR_LIMIT = 300; // tweak length per page

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
`;

const PageContainer = styled.View`
  flex: 1;
  padding: 24px;
  justify-content: center;
`;

const PageText = styled.Text`
  font-size: 20px;
  line-height: 28px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`;

const NavRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding: 16px;
`;

const NavButton = styled(TouchableOpacity)`
  padding: 12px;
`;

export default function TextStoryScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { fullStory = '' } = route.params;

  // 1) split story into pages by character
  const pages = React.useMemo(() => {
    const raw = fullStory.trim();
    const result: string[] = [];
    let idx = 0;
    while (idx < raw.length) {
      result.push(raw.slice(idx, idx + PAGE_CHAR_LIMIT));
      idx += PAGE_CHAR_LIMIT;
    }
    return result;
  }, [fullStory]);

  // 2) handle the logo spin
  const spinAnim = React.useRef(new Animated.Value(0)).current;
  const [showContent, setShowContent] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 1000, // quick spin
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => setShowContent(true), 200);
    });
  }, [spinAnim]);

  // 3) page state
  const [page, setPage] = React.useState(0);

  // 4) spin interpolation
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Container>
      <TopNav navigation={navigation} />
      {!showContent ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <AuroraLogo fill='black' width={120} height={120} />
          </Animated.View>
        </View>
      ) : (
        <>
          <PageContainer>
            <PageText>{pages[page]}</PageText>
          </PageContainer>
          <NavRow>
            <NavButton
              disabled={page === 0}
              onPress={() => setPage((p) => Math.max(p - 1, 0))}
            >
              <Text style={{ color: page === 0 ? theme.colors.muted : theme.colors.primary }}>
                ← Previous
              </Text>
            </NavButton>
            <NavButton
              disabled={page === pages.length - 1}
              onPress={() => setPage((p) => Math.min(p + 1, pages.length - 1))}
            >
              <Text style={{ color: page === pages.length - 1 ? theme.colors.muted : theme.colors.primary }}>
                Next →
              </Text>
            </NavButton>
          </NavRow>
        </>
      )}
      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </Container>
  );
}
