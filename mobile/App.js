import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketProvider } from './src/context/SocketContext';
import { UserProvider } from './src/context/UserContext';
import theme from './src/styles/theme';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import GameScreen from './src/screens/GameScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

// Dark theme for navigation
const DarkNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: theme.colors.cyan,
    background: theme.colors.background,
    card: theme.colors.background,
    text: theme.colors.textPrimary,
    border: theme.colors.border,
    notification: theme.colors.cyan,
  },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      const username = await AsyncStorage.getItem('username');
      
      if (userId && username) {
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <UserProvider>
      <SocketProvider>
        <NavigationContainer theme={DarkNavigationTheme}>
          <Stack.Navigator
            initialRouteName={isLoggedIn ? 'Home' : 'Login'}
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
            />
            <Stack.Screen 
              name="Game" 
              component={GameScreen}
            />
            <Stack.Screen 
              name="Leaderboard" 
              component={LeaderboardScreen}
            />
            <Stack.Screen 
              name="Profile" 
              component={ProfileScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SocketProvider>
    </UserProvider>
  );
}

