import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, StatusBar, SafeAreaView } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import theme from '../styles/theme';

const GameScreen = ({ route }) => {
  const { gameId: initialGameId, opponent: initialOpponent, yourSymbol: initialYourSymbol } = route.params;
  const { socket } = useSocket();
  const { user } = useUser();
  const navigation = useNavigation();

  const [gameId, setGameId] = useState(initialGameId);
  const [board, setBoard] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [yourSymbol, setYourSymbol] = useState(initialYourSymbol);
  const [opponent, setOpponent] = useState(initialOpponent);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
    }
  }, [user, navigation]);

  useEffect(() => {
    if (!socket) return;

    socket.on('moveMade', (data) => {
      console.log('Move made:', data);
      setBoard(data.board);
      setCurrentTurn(data.currentTurn);
      setGameOver(data.gameOver);
      setWinner(data.winner);
      setIsDraw(data.isDraw);
      setErrorMessage('');

      if (data.gameOver) {
        setTimeout(() => {
          let message = '';
          if (data.isDraw) {
            message = "It's a Draw!";
          } else if (data.winner && data.winner.userId === user.userId) {
            message = 'You Win! +3 pts';
          } else {
            message = 'You Lose!';
          }
          Alert.alert('Game Over', message, [
            { text: 'OK', onPress: () => navigation.navigate('Home') }
          ]);
        }, 500);
      }
    });

    socket.on('gameEnded', (data) => {
      console.log('Game ended:', data);
      Alert.alert('Game Ended', data.message, [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    });

    socket.on('error', (data) => {
      console.error('Game error:', data.message);
      setErrorMessage(data.message);
    });

    return () => {
      socket.off('moveMade');
      socket.off('gameEnded');
      socket.off('error');
    };
  }, [socket, user, navigation]);

  const handlePress = (row, col) => {
    if (gameOver || board[row][col] !== '' || currentTurn !== yourSymbol) {
      if (board[row][col] !== '') {
        setErrorMessage('Cell already taken');
        setTimeout(() => setErrorMessage(''), 2000);
      }
      return;
    }

    socket.emit('makeMove', { gameId, userId: user.userId, row, col });
  };

  const renderCell = (row, col) => {
    const cellValue = board[row][col];
    const isWinningCell = winner && winner.winningLine && winner.winningLine.some(
      (cell) => cell[0] === row && cell[1] === col
    );

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={[
          styles.cell,
          isWinningCell && styles.winningCell,
        ]}
        onPress={() => handlePress(row, col)}
        disabled={gameOver || cellValue !== '' || currentTurn !== yourSymbol}
      >
        {cellValue === 'X' && (
          <View style={styles.xMark}>
            <View style={[styles.xLine, styles.xLine1]} />
            <View style={[styles.xLine, styles.xLine2]} />
          </View>
        )}
        {cellValue === 'O' && (
          <View style={styles.oMark} />
        )}
      </TouchableOpacity>
    );
  };

  // Loading state
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>

        {/* Header with Title */}
        <Text style={styles.title}>Tic-Tac-Toe</Text>

        {/* Player Indicators */}
        <View style={styles.playersContainer}>
          {/* You */}
          <View style={styles.playerSection}>
            <View style={[
              styles.playerCircle,
              yourSymbol === currentTurn && styles.playerCircleActive,
              { borderColor: theme.colors.orange }
            ]}>
              <View style={[
                styles.playerCircleFill,
                { backgroundColor: theme.colors.orange }
              ]} />
            </View>
            <Text style={styles.playerLabel}>You</Text>
          </View>

          {/* Turn Indicator */}
          <View style={styles.turnIndicator}>
            <Text style={styles.turnText}>
              Your turn — {yourSymbol}
            </Text>
          </View>

          {/* Opponent */}
          <View style={styles.playerSection}>
            <View style={[
              styles.playerCircle,
              opponent.symbol === currentTurn && styles.playerCircleActive,
              { borderColor: theme.colors.purple }
            ]}>
              <View style={[
                styles.playerCircleFill,
                { backgroundColor: theme.colors.purple }
              ]} />
            </View>
            <Text style={styles.playerLabel}>Opponent</Text>
          </View>
        </View>

        {/* Game Board */}
        <View style={styles.boardContainer}>
          <View style={styles.board}>
            {board.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.row}>
                {row.map((cell, colIndex) => renderCell(rowIndex, colIndex))}
              </View>
            ))}
          </View>
        </View>

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginBottom: 40,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: 10,
  },
  playerSection: {
    alignItems: 'center',
    gap: 12,
  },
  playerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  playerCircleActive: {
    borderWidth: 4,
  },
  playerCircleFill: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  playerLabel: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.medium,
  },
  turnIndicator: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  turnText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.medium,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  board: {
    width: '100%',
    maxWidth: 400,
    aspectRatio: 1,
    backgroundColor: theme.colors.boardBackground,
    borderRadius: 16,
    padding: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    margin: 4,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.boardGrid,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  winningCell: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderColor: theme.colors.orange,
  },
  xMark: {
    width: '60%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xLine: {
    position: 'absolute',
    width: '100%',
    height: 6,
    backgroundColor: theme.colors.cyan,
    borderRadius: 3,
  },
  xLine1: {
    transform: [{ rotate: '45deg' }],
  },
  xLine2: {
    transform: [{ rotate: '-45deg' }],
  },
  oMark: {
    width: '60%',
    height: '60%',
    borderRadius: 100,
    borderWidth: 6,
    borderColor: theme.colors.purple,
  },
  errorContainer: {
    backgroundColor: theme.colors.card,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: theme.typography.medium,
    textAlign: 'center',
  },
});

export default GameScreen;
