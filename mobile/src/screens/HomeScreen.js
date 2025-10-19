import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useUser } from '../context/UserContext';
import { useSocket } from '../context/SocketContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useUser();
  const { socket, connected } = useSocket();
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Listen for game found
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
      yourSymbol: data.yourSymbol
    });
  };

  const handleQueueJoined = (data) => {
    console.log('Queue joined:', data);
  };

  const handleError = (error) => {
    setSearching(false);
    Alert.alert('Error', error.message || 'Something went wrong');
  };

  const handleQuickPlay = () => {
    if (!connected) {
      Alert.alert('Error', 'Not connected to server');
      return;
    }

    setSearching(true);
    socket.emit('joinQueue', {
      userId: user.userId,
      username: user.username
    });
  };

  const handleCancelSearch = () => {
    socket.emit('leaveQueue', { userId: user.userId });
    setSearching(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
        <Text style={styles.statusText}>
          {connected ? '🟢 Online' : '🔴 Offline'}
        </Text>
      </View>

      {searching ? (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.searchingText}>Searching for opponent...</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSearch}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleQuickPlay}
            disabled={!connected}
          >
            <Text style={styles.buttonText}>⚡ Quick Play</Text>
            <Text style={styles.buttonSubtext}>Find a random opponent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.buttonText}>🏆 Leaderboard</Text>
            <Text style={styles.buttonSubtext}>View top players</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.buttonText}>👤 Profile</Text>
            <Text style={styles.buttonSubtext}>View your stats</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
  },
  searchingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchingText: {
    fontSize: 18,
    marginTop: 20,
    color: '#333',
  },
  cancelButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#cf6679',
    borderRadius: 10,
    paddingHorizontal: 40,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  button: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButton: {
    backgroundColor: '#6200ee',
  },
  secondaryButton: {
    backgroundColor: '#03dac6',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#cf6679',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#cf6679',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

