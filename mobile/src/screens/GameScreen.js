import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions
} from 'react-native';
import { useSocket } from '../context/SocketContext';
import { useUser } from '../context/UserContext';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CELL_SIZE = (SCREEN_WIDTH - 60) / 3;

export default function GameScreen({ route, navigation }) {
  const { gameId, opponent, yourSymbol } = route.params;
  const { socket } = useSocket();
  const { user } = useUser();

  const [board, setBoard] = useState([
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ]);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('moveMade', handleMoveMade);
    socket.on('gameStarted', handleGameStarted);
    socket.on('error', handleError);

    return () => {
      socket.off('moveMade', handleMoveMade);
      socket.off('gameStarted', handleGameStarted);
      socket.off('error', handleError);
    };
  }, [socket]);

  const handleGameStarted = (data) => {
    setBoard(data.board);
    setCurrentTurn(data.currentTurn);
  };

  const handleMoveMade = (data) => {
    setBoard(data.board);
    setCurrentTurn(data.currentTurn);

    if (data.gameOver) {
      setGameOver(true);
      setIsDraw(data.isDraw);
      setWinner(data.winner);

      setTimeout(() => {
        if (data.isDraw) {
          Alert.alert('Game Over', "It's a draw!", [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else if (data.winner.userId === user.userId) {
          Alert.alert('Congratulations!', 'You won! 🎉', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert('Game Over', 'You lost. Better luck next time!', [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]);
        }
      }, 500);
    }
  };

  const handleError = (error) => {
    Alert.alert('Error', error.message || 'Something went wrong');
  };

  const handleCellPress = (row, col) => {
    if (gameOver) return;
    if (board[row][col] !== '') return;
    if (currentTurn !== yourSymbol) {
      Alert.alert('Not your turn', "Wait for your opponent's move");
      return;
    }

    socket.emit('makeMove', {
      gameId,
      userId: user.userId,
      row,
      col
    });
  };

  const renderCell = (row, col) => {
    const value = board[row][col];
    const isMySymbol = value === yourSymbol;

    return (
      <TouchableOpacity
        key={`${row}-${col}`}
        style={styles.cell}
        onPress={() => handleCellPress(row, col)}
        disabled={gameOver || value !== ''}
      >
        <Text style={[
          styles.cellText,
          isMySymbol ? styles.mySymbol : styles.opponentSymbol
        ]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRow = (rowIndex) => {
    return (
      <View key={rowIndex} style={styles.row}>
        {[0, 1, 2].map(colIndex => renderCell(rowIndex, colIndex))}
      </View>
    );
  };

  const isMyTurn = currentTurn === yourSymbol && !gameOver;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>You ({yourSymbol})</Text>
          <View style={[styles.turnIndicator, isMyTurn && styles.activeTurn]} />
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>
            {opponent.username} ({yourSymbol === 'X' ? 'O' : 'X'})
          </Text>
          <View style={[styles.turnIndicator, !isMyTurn && !gameOver && styles.activeTurn]} />
        </View>
      </View>

      <View style={styles.turnIndicatorContainer}>
        <Text style={styles.turnText}>
          {gameOver
            ? (isDraw ? "It's a Draw!" : `${winner?.username} Wins!`)
            : isMyTurn
            ? 'Your Turn'
            : "Opponent's Turn"
          }
        </Text>
      </View>

      <View style={styles.board}>
        {[0, 1, 2].map(rowIndex => renderRow(rowIndex))}
      </View>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          Alert.alert(
            'Leave Game',
            'Are you sure you want to leave this game?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Leave', onPress: () => navigation.goBack(), style: 'destructive' }
            ]
          );
        }}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
  },
  playerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  turnIndicator: {
    width: 30,
    height: 6,
    backgroundColor: '#ccc',
    borderRadius: 3,
  },
  activeTurn: {
    backgroundColor: '#6200ee',
  },
  vs: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginHorizontal: 10,
  },
  turnIndicatorContainer: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  turnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  board: {
    alignSelf: 'center',
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#fff',
    margin: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  cellText: {
    fontSize: 60,
    fontWeight: 'bold',
  },
  mySymbol: {
    color: '#6200ee',
  },
  opponentSymbol: {
    color: '#cf6679',
  },
  backButton: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  backButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

