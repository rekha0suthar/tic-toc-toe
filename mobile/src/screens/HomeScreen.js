import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';
import theme from '../styles/theme';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useUser();
  const { socket, connected } = useSocket();
  const [searching, setSearching] = useState(false);
  const spinValue = useState(new Animated.Value(0))[0];

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user, navigation]);

  useEffect(() => {
    if (searching) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [searching]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (!socket) return;

    socket.on('gameFound', handleGameFound);
    socket.on('queueJoined', handleQueueJoined);
    socket.on('error', handleError);

    return () => {
      socket.off('gameFound', handleGameFound);
      socket.off('queueJoined', handleQueueJoined);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleGameFound = (data) => {
    setSearching(false);
    navigation.navigate('Game', {
      gameId: data.gameId,
      opponent: data.opponent,
      yourSymbol: data.yourSymbol,
    });
  };

  const handleQueueJoined = (data) => {
    console.log('Queue joined:', data);
  };

  const handleError = (error) => {
    setSearching(false);
    console.error('Error:', error.message);
  };

  const handleQuickPlay = () => {
    if (!connected) {
      return;
    }

    setSearching(true);
    socket.emit('joinQueue', {
      userId: user.userId,
      username: user.username,
    });
  };

  const handleCancelSearch = () => {
    socket.emit('leaveQueue', { userId: user.userId });
    setSearching(false);
  };

  // Loading state
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.container}>
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="large" color={theme.colors.cyan} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Show matchmaking screen when searching
  if (searching) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.container}>
          <View style={styles.searchingContainer}>
            <Text style={styles.searchingText}>Finding a random player...</Text>
            
            <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
              <View style={styles.spinnerSegment} />
            </Animated.View>

            <TouchableOpacity
              style={styles.cancelButtonContainer}
              onPress={handleCancelSearch}
              activeOpacity={0.9}
            >
              <View style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main home screen
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {user.username}!</Text>
          <Text style={styles.statusText}>
            {connected ? '● Connected' : '○ Disconnected'}
          </Text>
        </View>

        {/* Main Menu */}
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuButtonContainer}
            onPress={handleQuickPlay}
            disabled={!connected}
            activeOpacity={0.9}
          >
            <View style={[styles.menuButton, !connected && styles.menuButtonDisabled]}>
              <Text style={styles.menuButtonText}>Quick Play</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButtonContainer}
            onPress={() => navigation.navigate('Leaderboard')}
            activeOpacity={0.9}
          >
            <View style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Leaderboard</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButtonContainer}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.9}
          >
            <View style={styles.menuButton}>
              <Text style={styles.menuButtonText}>Profile</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButtonContainer}
            onPress={logout}
            activeOpacity={0.9}
          >
            <View style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  header: {
    marginBottom: 60,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  menu: {
    gap: 20,
  },
  menuButtonContainer: {
    width: '100%',
  },
  menuButton: {
    backgroundColor: theme.colors.cyan,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '-8deg' }],
    ...theme.shadows.cyan,
  },
  menuButtonDisabled: {
    backgroundColor: theme.colors.cardLight,
    opacity: 0.5,
  },
  menuButtonText: {
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: theme.typography.bold,
    transform: [{ skewX: '8deg' }],
  },
  logoutButtonContainer: {
    width: '100%',
    marginTop: 20,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '-8deg' }],
  },
  logoutButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: theme.typography.semibold,
    transform: [{ skewX: '8deg' }],
  },
  // Searching/Matchmaking Screen
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  searchingText: {
    fontSize: 28,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginBottom: 80,
    textAlign: 'center',
  },
  spinner: {
    width: 80,
    height: 80,
    marginBottom: 80,
  },
  spinnerSegment: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    borderWidth: 6,
    borderColor: 'transparent',
    borderTopColor: theme.colors.cyan,
    borderRightColor: theme.colors.cyan,
  },
  cancelButtonContainer: {
    width: '80%',
  },
  cancelButton: {
    backgroundColor: theme.colors.cyan,
    paddingVertical: 18,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    ...theme.shadows.cyan,
  },
  cancelButtonText: {
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: theme.typography.bold,
  },
});
