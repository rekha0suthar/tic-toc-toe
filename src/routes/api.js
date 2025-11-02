import { Router } from 'express';
import User from '../models/User.js';
import Game from '../models/Game.js';
import LeaderboardService from '../services/LeaderboardService.js';
import logger from '../config/logger.js';

const router = Router();

/**
 * Create or get user
 */
router.post('/users', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Check if user already exists
    let user = await User.findOne({ username });

    if (!user) {
      user = new User({ username });
      await user.save();
      logger.info(`New user created: ${username}`);
    }

    res.json({
      userId: user._id,
      username: user.username,
      stats: user.stats
    });
  } catch (error) {
    logger.error('Error creating/getting user:', error);

    if (error.code === 11000) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user by ID
 */
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      userId: user._id,
      username: user.username,
      stats: user.stats,
      rank: user.rank,
      isOnline: user.isOnline,
      lastActive: user.lastActive
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user stats
 */
router.get('/users/:userId/stats', async (req, res) => {
  try {
    const stats = await LeaderboardService.getPlayerRank(req.params.userId);

    if (!stats) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(stats);
  } catch (error) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user's games
 */
router.get('/users/:userId/games', async (req, res) => {
  try {
    const { status } = req.query;

    const query = {
      'players.userId': req.params.userId
    };

    if (status) {
      query.status = status;
    }

    const games = await Game.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(games);
  } catch (error) {
    logger.error('Error fetching user games:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get game by ID
 */
router.get('/games/:gameId', async (req, res) => {
  try {
    const game = await Game.findOne({ gameId: req.params.gameId });

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    logger.error('Error fetching game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get leaderboard
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const leaderboard = await LeaderboardService.getTopPlayers(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    logger.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get leaderboard around player
 */
router.get('/leaderboard/around/:userId', async (req, res) => {
  try {
    const { range = 5 } = req.query;
    const leaderboard = await LeaderboardService.getLeaderboardAroundPlayer(
      req.params.userId,
      parseInt(range)
    );
    res.json(leaderboard);
  } catch (error) {
    logger.error('Error fetching leaderboard around player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get statistics summary
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const summary = await LeaderboardService.getStatsSummary();
    res.json(summary);
  } catch (error) {
    logger.error('Error fetching stats summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get active games count
 */
router.get('/games/active/count', async (req, res) => {
  try {
    const count = await Game.countDocuments({ status: 'active' });
    res.json({ activeGames: count });
  } catch (error) {
    logger.error('Error fetching active games count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

