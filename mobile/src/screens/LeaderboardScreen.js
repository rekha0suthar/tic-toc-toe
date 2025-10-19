import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { API_URL } from '../config/constants';

export default function LeaderboardScreen() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/leaderboard?limit=50`);
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  const renderItem = ({ item }) => {
    const isTopThree = item.rank <= 3;
    const medal = item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : item.rank === 3 ? '🥉' : '';

    return (
      <View style={[styles.item, isTopThree && styles.topThreeItem]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, isTopThree && styles.topThreeRank]}>
            {medal || `#${item.rank}`}
          </Text>
        </View>
        
        <View style={styles.playerInfo}>
          <Text style={[styles.username, isTopThree && styles.topThreeUsername]}>
            {item.username}
          </Text>
          <View style={styles.stats}>
            <Text style={styles.stat}>
              Wins: {item.gamesWon}/{item.gamesPlayed}
            </Text>
            <Text style={styles.stat}>
              Win Rate: {item.winRate.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={[styles.score, isTopThree && styles.topThreeScore]}>
            {item.totalScore}
          </Text>
          <Text style={styles.scoreLabel}>pts</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Top Players</Text>
        <Text style={styles.headerSubtitle}>
          Compete to reach the top!
        </Text>
      </View>

      <FlatList
        data={leaderboard}
        renderItem={renderItem}
        keyExtractor={(item) => item.rank.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No players yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#6200ee',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  list: {
    padding: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  topThreeItem: {
    backgroundColor: '#fff8e1',
    borderWidth: 2,
    borderColor: '#ffd54f',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  topThreeRank: {
    fontSize: 24,
    color: '#ff6f00',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  topThreeUsername: {
    fontSize: 20,
    color: '#ff6f00',
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
  },
  stat: {
    fontSize: 12,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'center',
    marginLeft: 10,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  topThreeScore: {
    fontSize: 28,
    color: '#ff6f00',
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

