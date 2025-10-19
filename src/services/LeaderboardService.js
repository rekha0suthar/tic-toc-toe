import User from '../models/User.js';
import logger from '../config/logger.js';

class LeaderboardService {
  /**
   * Get top players by total score
   */
  async getTopPlayers(limit = 100) {
    try {
      const topPlayers = await User.find({
        'stats.gamesPlayed': { $gt: 0 }
      })
      .sort({ 'stats.totalScore': -1, 'stats.winRate': -1 })
      .limit(limit)
      .select('username stats rank')
      .lean();

      return topPlayers.map((player, index) => ({
        rank: index + 1,
        username: player.username,
        gamesPlayed: player.stats.gamesPlayed,
        gamesWon: player.stats.gamesWon,
        gamesLost: player.stats.gamesLost,
        gamesDraw: player.stats.gamesDraw,
        totalScore: player.stats.totalScore,
        winRate: Math.round(player.stats.winRate * 100) / 100
      }));
    } catch (error) {
      logger.error('Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get player rank and stats
   */
  async getPlayerRank(userId) {
    try {
      const user = await User.findById(userId).select('username stats').lean();
      
      if (!user) {
        return null;
      }

      // Count how many players have higher score
      const playersAbove = await User.countDocuments({
        $or: [
          { 'stats.totalScore': { $gt: user.stats.totalScore } },
          {
            'stats.totalScore': user.stats.totalScore,
            'stats.winRate': { $gt: user.stats.winRate }
          }
        ]
      });

      const rank = playersAbove + 1;

      return {
        rank,
        username: user.username,
        gamesPlayed: user.stats.gamesPlayed,
        gamesWon: user.stats.gamesWon,
        gamesLost: user.stats.gamesLost,
        gamesDraw: user.stats.gamesDraw,
        totalScore: user.stats.totalScore,
        winRate: Math.round(user.stats.winRate * 100) / 100
      };
    } catch (error) {
      logger.error('Error fetching player rank:', error);
      throw error;
    }
  }

  /**
   * Update all player ranks (can be scheduled periodically)
   */
  async updateAllRanks() {
    try {
      const players = await User.find({ 'stats.gamesPlayed': { $gt: 0 } })
        .sort({ 'stats.totalScore': -1, 'stats.winRate': -1 })
        .select('_id');

      const bulkOps = players.map((player, index) => ({
        updateOne: {
          filter: { _id: player._id },
          update: { rank: index + 1 }
        }
      }));

      if (bulkOps.length > 0) {
        await User.bulkWrite(bulkOps);
        logger.info(`Updated ranks for ${bulkOps.length} players`);
      }

      return bulkOps.length;
    } catch (error) {
      logger.error('Error updating ranks:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard around a specific player
   */
  async getLeaderboardAroundPlayer(userId, range = 5) {
    try {
      const playerRank = await this.getPlayerRank(userId);
      
      if (!playerRank) {
        return { player: null, above: [], below: [] };
      }

      const startRank = Math.max(1, playerRank.rank - range);
      const endRank = playerRank.rank + range;

      const players = await User.find({
        'stats.gamesPlayed': { $gt: 0 }
      })
      .sort({ 'stats.totalScore': -1, 'stats.winRate': -1 })
      .skip(startRank - 1)
      .limit(endRank - startRank + 1)
      .select('username stats')
      .lean();

      const leaderboard = players.map((player, index) => ({
        rank: startRank + index,
        username: player.username,
        gamesPlayed: player.stats.gamesPlayed,
        gamesWon: player.stats.gamesWon,
        totalScore: player.stats.totalScore,
        winRate: Math.round(player.stats.winRate * 100) / 100
      }));

      return leaderboard;
    } catch (error) {
      logger.error('Error fetching leaderboard around player:', error);
      throw error;
    }
  }

  /**
   * Get statistics summary
   */
  async getStatsSummary() {
    try {
      const totalPlayers = await User.countDocuments();
      const activePlayers = await User.countDocuments({ 'stats.gamesPlayed': { $gt: 0 } });
      
      const stats = await User.aggregate([
        {
          $group: {
            _id: null,
            totalGames: { $sum: '$stats.gamesPlayed' },
            totalWins: { $sum: '$stats.gamesWon' },
            totalDraws: { $sum: '$stats.gamesDraw' },
            avgWinRate: { $avg: '$stats.winRate' }
          }
        }
      ]);

      return {
        totalPlayers,
        activePlayers,
        totalGames: stats[0]?.totalGames || 0,
        totalWins: stats[0]?.totalWins || 0,
        totalDraws: stats[0]?.totalDraws || 0,
        avgWinRate: Math.round((stats[0]?.avgWinRate || 0) * 100) / 100
      };
    } catch (error) {
      logger.error('Error fetching stats summary:', error);
      throw error;
    }
  }
}

export default new LeaderboardService();

