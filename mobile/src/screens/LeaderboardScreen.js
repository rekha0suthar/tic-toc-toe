import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { API_URL } from '../config/constants';
import theme from '../styles/theme';

export default function LeaderboardScreen({ navigation }) {
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

  const renderHeader = () => (
    <View style={styles.tableHeader}>
      <Text style={[styles.headerText, styles.rankColumn]}>#</Text>
      <Text style={[styles.headerText, styles.nameColumn]}>Name</Text>
      <Text style={[styles.headerText, styles.recordColumn]}>W/L/D</Text>
      <Text style={[styles.headerText, styles.scoreColumn]}>Score</Text>
    </View>
  );

  const renderItem = ({ item, index }) => {
    const isTopPlayer = index === 0;

    return (
      <View style={[styles.tableRow, isTopPlayer && styles.topPlayerRow]}>
        <Text style={[styles.cellText, styles.rankColumn, isTopPlayer && styles.topPlayerText]}>
          {item.rank}
        </Text>
        <Text style={[styles.cellText, styles.nameColumn, isTopPlayer && styles.topPlayerText]}>
          {item.username}
        </Text>
        <Text style={[styles.cellText, styles.recordColumn, isTopPlayer && styles.topPlayerText]}>
          {item.gamesWon}/{item.gamesLost}/{item.gamesDraw}
        </Text>
        <Text style={[styles.cellText, styles.scoreColumn, isTopPlayer && styles.topPlayerText]}>
          {item.totalScore}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.cyan} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
      </View>

      {/* Table */}
      <View style={styles.tableContainer}>
        <FlatList
          data={leaderboard}
          renderItem={renderItem}
          keyExtractor={(item) => item.rank.toString()}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={theme.colors.cyan}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No players yet</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButtonContainer}
        onPress={() => navigation.goBack()}
        activeOpacity={0.9}
      >
        <View style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </View>
      </TouchableOpacity>
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
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  header: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerText: {
    fontSize: 14,
    fontWeight: theme.typography.bold,
    color: theme.colors.textSecondary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
  },
  topPlayerRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.medium,
  },
  topPlayerText: {
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
  },
  rankColumn: {
    width: 40,
  },
  nameColumn: {
    flex: 1,
  },
  recordColumn: {
    width: 80,
    textAlign: 'right',
  },
  scoreColumn: {
    width: 60,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  backButtonContainer: {
    marginHorizontal: 30,
    marginVertical: 20,
  },
  backButton: {
    backgroundColor: theme.colors.cyan,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '-8deg' }],
    ...theme.shadows.cyan,
  },
  backButtonText: {
    color: theme.colors.black,
    fontSize: 18,
    fontWeight: theme.typography.bold,
    transform: [{ skewX: '8deg' }],
  },
});
