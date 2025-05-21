// src/screens/harmony/TextStoryScreen.tsx
import React, { useRef } from 'react';
import { Dimensions, View, Text, TouchableOpacity, Animated, Image, FlatList } from 'react-native';
import styled, { useTheme, DefaultTheme } from 'styled-components/native';
import TopNav from '../../components/common/TopNav';
import BottomNav from '../../components/common/BottomNav';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import AuroraLogo from '../../assets/system/colorlogo';
import { StoryPage, prebuiltStoryPages } from '../../data/prebuiltStoryPages';
import LottieView from 'lottie-react-native';
import PrevIcon from '../../assets/icons/common/PrevIcon';
import NextIcon from '../../assets/icons/common/NextIcon'; 

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
  padding-bottom: 56px;
`;

const PageText = styled.Text`
  font-size: 20px;
  line-height: 28px;
  margin-top: 28px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.text};
`;

const NavButton = styled(TouchableOpacity)`
  padding: 12px;
`;

const Pagination = styled.View`
  position: absolute;
  bottom: ${({ theme }: { theme: DefaultTheme }) => theme.sizes.bottomNavHeight + 16}px;
  left: 0;
  right: 0;
  flex-direction: row;
  justify-content: space-between;
  padding-horizontal: 24px;
  padding-bottom: 48px;
  z-index: 10;
`;

export default function TextStoryScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const listRef = useRef<FlatList<any>>(null);
  const { fullStory = '' } = route.params;

  // 1) split story into pages on whole sentences
  const pages: StoryPage[] = React.useMemo(() => {
    // 0) manual override for any prebuilt story
    const manual = prebuiltStoryPages[route.params.storyId];
    if (manual) return manual;

    // trim leading/trailing whitespace first
    const text = fullStory.trim();
    if (!text) return []; 

    // break into sentences (keeping punctuation)
    const sentences = text
    .split(/([.?!])\s+/)
    .reduce<string[]>((acc, piece, i, arr) => {
        if (/[.?!]/.test(piece) && i < arr.length - 1) {
            // append punctuation + space to previous sentence
            acc[acc.length - 1] += piece + ' ';
        } else {
            acc.push(piece);
        }
        return acc;
    }, []);

    const result: string[] = [];
    let buffer = '';
    for (const s of sentences) {
        if (buffer.length + s.length > PAGE_CHAR_LIMIT) {
            result.push(buffer.trim());
            buffer = '';
        }
        buffer += s;
    }
    // leftover
    if (buffer.trim()) result.push(buffer.trim());

    return result.map(str => ({ text: str }));;
}, [fullStory, route.params.storyId]);

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
          <FlatList
          style={{ flex: 1}}
          ref={listRef}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={ev => {
            const idx = Math.round(ev.nativeEvent.contentOffset.x / SCREEN_W);
            setPage(idx);
          }}
          renderItem={({ item }) => (
            <PageContainer style={{ width: SCREEN_W }}>
                 {/* optional static image */}
                {item.image && (
                    <Image
                    source={
                        typeof item.image === 'string'
                        ? { uri: item.image }
                        : item.image
                    }
                    style={{
                        width: SCREEN_W * 0.8,
                        height: SCREEN_H * 0.3,
                        marginBottom: 16,
                        borderRadius: 16,
                    }}
                    resizeMode='cover'
                    />
                )}
                {/* optional Lottie animation */}
                {pages[page].animation && (
                    <LottieView
                    source={item.animation}
                    autoPlay
                    loop
                    style={{
                        width: SCREEN_W * 0.8,
                        height: SCREEN_H * 0.3,
                        marginBottom: 16,
                    }}
                    />
                )}
                <PageText>{item.text}</PageText>
                {/* visual progress indicator */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 8 }}>
                    {pages.map((_, i) => (
                    <View
                    key={i}
                    style={{
                        width: 8,
                        height: 8,
                        margin: 4,
                        borderRadius: 4,
                        backgroundColor: i === page ? theme.colors.primary : theme.colors.muted,
                    }}
                    />
                    ))}
                    </View>
                    {/* <Pagination>
                        <NavButton
                        disabled={page === 0}
                        onPress={() => {
                            const prev = Math.max(page -1, 0);
                            listRef.current?.scrollToOffset({ offset: prev * SCREEN_W });
                            setPage(prev);
                        }}
                        >
                        <PrevIcon
                        stroke={page === 0 ? theme.colors.muted : theme.colors.primary}
                        width={50}
                        height={50}
                        />
                        </NavButton>
                    
                        <NavButton
                        disabled={page === pages.length - 1}
                        onPress={() => {
                            const next = Math.min(page + 1, pages.length - 1);
                            listRef.current?.scrollToOffset({ offset: next * SCREEN_W });
                            setPage(next);
                        }}
                        >
                        <NextIcon
                            stroke={page === pages.length - 1 ? 
                                theme.colors.muted : theme.colors.primary}
                            width={50}
                            height={50}
                        />
                    </NavButton>
                </Pagination> */}
            </PageContainer>
          )}
          />
        </>
      )}
      <BottomNav navigation={navigation} activeScreen="Harmony" />
    </Container>
  );
}
