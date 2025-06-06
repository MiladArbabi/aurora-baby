// src/tests/screens/BabyProfileScreen.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import BabyProfileScreen from '../screens/onboarding/BabyProfileScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import * as Access from '../services/ChildProfileAccess'

// Mocks
jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }))
jest.mock('../../services/ChildProfileAccess', () => ({
  saveChildProfile: jest.fn(),
}))

const Stack = createStackNavigator()

// ✅ Wrap BabyProfileScreen with mocked navigation props
function BabyProfileScreenWrapper({ navigation, route }) {
  return <BabyProfileScreen navigation={navigation} route={route} />
}

describe('BabyProfileScreen', () => {
  it('submits and saves the baby profile', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Child" component={BabyProfileScreenWrapper} />
        </Stack.Navigator>
      </NavigationContainer>
    )

    fireEvent.changeText(getByPlaceholderText('Child’s name'), 'Luna')
    fireEvent.changeText(getByPlaceholderText('Date of Birth (YYYY-MM-DD)'), '2023-01-01')

    const button = getByText('Next')
    fireEvent.press(button)

    expect(Access.saveChildProfile).toHaveBeenCalled()
  })
})
