import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useUser } from '../context/UserContext';
import { API_URL } from '../config/constants';
import theme from '../styles/theme';

export default function ProfileScreen({ navigation }) {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigation.replace('Login');
      return;
    }
    fetchStats();
  }, [user, navigation]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}/api/users/${user.userId}/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  // Early return if no user
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.cyan} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  const winPercentage = stats.gamesPlayed > 0
    ? ((stats.gamesWon / stats.gamesPlayed) * 100).toFixed(1)
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.cyan}
          />
        }
      >

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.username}>{stats.username}</Text>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>Rank #{stats.rank}</Text>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.gamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>

          <View style={[styles.statCard, styles.successCard]}>
            <Text style={[styles.statValue, styles.successText]}>
              {stats.gamesWon}
            </Text>
            <Text style={styles.statLabel}>Wins</Text>
          </View>

          <View style={[styles.statCard, styles.dangerCard]}>
            <Text style={[styles.statValue, styles.dangerText]}>
              {stats.gamesLost}
            </Text>
            <Text style={styles.statLabel}>Losses</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.gamesDraw}</Text>
            <Text style={styles.statLabel}>Draws</Text>
          </View>
        </View>
      </View>

      {/* Performance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        
        <View style={styles.performanceCard}>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Win Rate</Text>
            <Text style={styles.performanceValue}>{winPercentage}%</Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${winPercentage}%` }]} />
          </View>
        </View>

        <View style={styles.performanceCard}>
          <View style={styles.performanceRow}>
            <Text style={styles.performanceLabel}>Total Score</Text>
            <Text style={[styles.performanceValue, styles.scoreValue]}>
              {stats.totalScore} pts
            </Text>
          </View>
        </View>
      </View>

      {/* Back Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButtonWrapper}
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
        >
          <View style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </View>
        </TouchableOpacity>
      </View>
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  username: {
    fontSize: 32,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  rankBadge: {
    backgroundColor: theme.colors.cyan,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    transform: [{ skewX: '-8deg' }],
  },
  rankText: {
    fontSize: 16,
    fontWeight: theme.typography.bold,
    color: theme.colors.black,
    transform: [{ skewX: '8deg' }],
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  successCard: {
    borderColor: theme.colors.cyan,
    borderWidth: 2,
  },
  dangerCard: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  statValue: {
    fontSize: 36,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  successText: {
    color: theme.colors.cyan,
  },
  dangerText: {
    color: theme.colors.error,
  },
  statLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.medium,
  },
  performanceCard: {
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  performanceLabel: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.medium,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: theme.typography.bold,
    color: theme.colors.textPrimary,
  },
  scoreValue: {
    color: theme.colors.cyan,
  },
  progressBar: {
    height: 12,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: 6,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.cyan,
    borderRadius: 6,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  backButtonWrapper: {
    width: '100%',
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
