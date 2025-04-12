import React, { useState } from 'react';
import { View, Text, Alert, TextInput, Platform, ImageBackground } from 'react-native';
import styled from 'styled-components/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Button from '../components/common/Button';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/firebase';
import Constants from 'expo-constants';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator'; // Updated
import { DefaultTheme } from 'styled-components/native';

type AuthScreenProps = StackScreenProps<RootStackParamList, 'Auth'>; // Updated

const Container = styled.ImageBackground`
  flex: 1;
  align-items: center;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const LogoImage = styled.Image`
  width: 125px;
  height: 125px;
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xlarge}px;
`;

const LogoText = styled.Text`
  font-size: 36px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  text-align: center;
`;

const Subtext = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.muted};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  text-align: center;
  margin-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
`;

const ButtonContainer = styled.View`
  width: 100%;
  align-items: center;
  flex: 1;
  justify-content: center;
`;

const SocialButton = styled(Button)`
  width: 325px;
  height: 55px;
  margin-bottom: 15px;
  background-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  padding-top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
  padding-right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  padding-bottom: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
  padding-left: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  border-width: 1px;
  border-color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
`;

const SocialButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const SocialIcon = styled.Image`
  width: 30px;
  height: 30px;
  margin-right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
`;

const Input = styled.TextInput`
  width: 325px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px;
  margin: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px 0;
  border: 1px solid ${({ theme }: { theme: DefaultTheme }) => theme.colors.border};
  border-radius: 5px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
`;

const OtherOptionsText = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.primary};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  text-decoration-line: underline;
`;

const FooterText = styled.Text`
  font-size: 10px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.contrastText};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.inter};
  text-align: center;
`;

const TermsText = styled.Text`
  font-weight: 500;
`;

const PrivacyText = styled.Text`
  font-weight: 300;
`;

const SkipButtonContainer = styled.TouchableOpacity`
  background-color: #453F4E;
  border-radius: 25px;
  padding: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.small}px ${({ theme }: { theme: DefaultTheme }) => theme.spacing.medium}px;
  position: absolute;
  top: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.xlarge}px;
  right: ${({ theme }: { theme: DefaultTheme }) => theme.spacing.large}px;
`;

const SkipButtonText = styled.Text`
  font-size: 16px;
  color: ${({ theme }: { theme: DefaultTheme }) => theme.colors.background};
  font-family: ${({ theme }: { theme: DefaultTheme }) => theme.fonts.regular};
  text-align: center;
`;

const AuthScreen: React.FC<AuthScreenProps> = ({ navigation }) => { // Updated
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (Platform.OS !== 'web') {
    GoogleSignin.configure({
      webClientId: Constants.expoConfig?.extra?.googleWebClientId || '450824864919-2f0636shfkbv7ivr4nhjloiljs5r6tc9.apps.googleusercontent.com',
    });
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', 'Google Sign-In Failed: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      Alert.alert('Sign-In Error', error.message || 'Unknown error');
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await signUpWithEmail(email, password);
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Sign-Up Error', error.message || 'Unknown error');
    }
  };

  return (
    <Container source={require('../assets/png/system/lightbackground.png')} resizeMode="cover" testID="auth-container">
      <SkipButtonContainer testID="skip-button-container" onPress={() => console.log('Skip pressed')}>
        <SkipButtonText>SKIP</SkipButtonText>
      </SkipButtonContainer>
      <View>
        <LogoImage source={require('../assets/png/system/colorlogo.png')} testID="logo-image" />
        <LogoText>Aurora Baby</LogoText>
        <Subtext>harmony, care and wonder</Subtext>
      </View>
      <ButtonContainer>
        <SocialButton testID="styled-button-facebook" onPress={() => {}}>
          <SocialButtonContent>
            <SocialIcon source={require('../assets/png/auth/facebook-lightmode.png')} />
            <Text style={{ color: '#E9DAFA', fontFamily: 'Edrosa', fontSize: 16 }}>CONTINUE WITH FACEBOOK</Text>
          </SocialButtonContent>
        </SocialButton>
        <SocialButton testID="styled-button-google" onPress={handleGoogleSignIn}>
          <SocialButtonContent>
            <SocialIcon source={require('../assets/png/auth/google-lightmode.png')} />
            <Text style={{ color: '#E9DAFA', fontFamily: 'Edrosa', fontSize: 16 }}>CONTINUE WITH GOOGLE</Text>
          </SocialButtonContent>
        </SocialButton>
        <SocialButton testID="styled-button-apple" onPress={() => {}}>
          <SocialButtonContent>
            <SocialIcon source={require('../assets/png/auth/appleicon-lightmode.png')} />
            <Text style={{ color: '#E9DAFA', fontFamily: 'Edrosa', fontSize: 16 }}>CONTINUE WITH APPLE</Text>
          </SocialButtonContent>
        </SocialButton>
        {showEmail && (
          <>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <SocialButton text="Sign In" onPress={handleEmailSignIn} />
            <SocialButton text="Sign Up" onPress={handleEmailSignUp} />
          </>
        )}
        {!showEmail && <OtherOptionsText onPress={() => setShowEmail(true)}>Other options</OtherOptionsText>}
      </ButtonContainer>
      <FooterText testID="footer-text">
        By continuing, you agree to the <TermsText>Terms of Service</TermsText> and <PrivacyText>Privacy Policy</PrivacyText>
      </FooterText>
    </Container>
  );
};

export default AuthScreen;