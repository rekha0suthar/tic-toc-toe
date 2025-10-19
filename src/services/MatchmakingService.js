import { v4 as uuidv4 } from 'uuid';
import Game from '../models/Game.js';
import logger from '../config/logger.js';

class MatchmakingService {
  constructor() {
    this.queue = new Map(); // userId -> { userId, username, socketId, timestamp }
    this.activeGames = new Map(); // gameId -> Game
  }

  /**
   * Add player to matchmaking queue
   */
  async addToQueue(userId, username, socketId) {
    if (this.queue.has(userId.toString())) {
      return { success: false, error: 'Already in queue' };
    }

    this.queue.set(userId.toString(), {
      userId,
      username,
      socketId,
      timestamp: Date.now()
    });

    logger.info(`Player ${username} added to matchmaking queue`);

    // Try to find a match immediately
    const match = await this.findMatch(userId);
    
    if (match) {
      return { success: true, matched: true, game: match };
    }

    return { success: true, matched: false, queuePosition: this.queue.size };
  }

  /**
   * Remove player from queue
   */
  removeFromQueue(userId) {
    const removed = this.queue.delete(userId.toString());
    if (removed) {
      logger.info(`Player ${userId} removed from matchmaking queue`);
    }
    return removed;
  }

  /**
   * Find a match for a player
   */
  async findMatch(userId) {
    const player1 = this.queue.get(userId.toString());
    if (!player1) return null;

    // Find another player in queue (not the same player)
    for (const [id, player2] of this.queue.entries()) {
      if (id !== userId.toString()) {
        // Found a match!
        this.queue.delete(userId.toString());
        this.queue.delete(id);

        // Create game
        const game = await this.createGame(player1, player2);
        return game;
      }
    }

    return null;
  }

  /**
   * Create a new game
   */
  async createGame(player1, player2) {
    const gameId = uuidv4();

    // Randomly assign X and O
    const isPlayer1X = Math.random() < 0.5;

    const gameData = {
      gameId,
      status: 'active',
      players: [
        {
          userId: player1.userId,
          username: player1.username,
          symbol: isPlayer1X ? 'X' : 'O',
          socketId: player1.socketId
        },
        {
          userId: player2.userId,
          username: player2.username,
          symbol: isPlayer1X ? 'O' : 'X',
          socketId: player2.socketId
        }
      ],
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
      currentTurn: 'X',
      startedAt: Date.now()
    };

    const game = new Game(gameData);
    await game.save();

    this.activeGames.set(gameId, game);

    logger.info(`Game ${gameId} created between ${player1.username} and ${player2.username}`);

    return game;
  }

  /**
   * Create a private game (for custom matchmaking)
   */
  async createPrivateGame(userId, username, socketId) {
    const gameId = uuidv4();

    const gameData = {
      gameId,
      status: 'waiting',
      players: [
        {
          userId,
          username,
          symbol: 'X',
          socketId
        }
      ],
      board: [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ],
      currentTurn: 'X'
    };

    const game = new Game(gameData);
    await game.save();

    logger.info(`Private game ${gameId} created by ${username}`);

    return game;
  }

  /**
   * Join a private game
   */
  async joinPrivateGame(gameId, userId, username, socketId) {
    const game = await Game.findOne({ gameId, status: 'waiting' });

    if (!game) {
      return { success: false, error: 'Game not found or already started' };
    }

    if (game.players.length >= 2) {
      return { success: false, error: 'Game is full' };
    }

    // Check if user is already in the game
    if (game.players.some(p => p.userId.toString() === userId.toString())) {
      return { success: false, error: 'Already in this game' };
    }

    // Add second player
    game.players.push({
      userId,
      username,
      symbol: 'O',
      socketId
    });

    game.status = 'active';
    game.startedAt = Date.now();
    await game.save();

    this.activeGames.set(gameId, game);

    logger.info(`Player ${username} joined game ${gameId}`);

    return { success: true, game };
  }

  /**
   * Get active game by gameId
   */
  async getGame(gameId) {
    let game = this.activeGames.get(gameId);
    
    if (!game) {
      game = await Game.findOne({ gameId, status: { $in: ['waiting', 'active'] } });
      if (game) {
        this.activeGames.set(gameId, game);
      }
    }

    return game;
  }

  /**
   * Update game state
   */
  async updateGame(gameId, updateData) {
    const game = await Game.findOneAndUpdate(
      { gameId },
      updateData,
      { new: true }
    );

    if (game && (game.status === 'active' || game.status === 'waiting')) {
      this.activeGames.set(gameId, game);
    } else if (game) {
      this.activeGames.delete(gameId);
    }

    return game;
  }

  /**
   * End a game
   */
  async endGame(gameId, winnerId = null, isDraw = false) {
    const game = await this.getGame(gameId);
    
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    game.status = 'completed';
    game.completedAt = Date.now();
    game.isDraw = isDraw;

    if (winnerId) {
      const winner = game.players.find(p => p.userId.toString() === winnerId.toString());
      if (winner) {
        game.winner = {
          userId: winner.userId,
          username: winner.username,
          symbol: winner.symbol
        };
      }
    }

    await game.save();
    this.activeGames.delete(gameId);

    logger.info(`Game ${gameId} ended`);

    return { success: true, game };
  }

  /**
   * Get player's active games
   */
  async getPlayerGames(userId) {
    const games = await Game.find({
      'players.userId': userId,
      status: { $in: ['waiting', 'active'] }
    }).sort({ createdAt: -1 });

    return games;
  }

  /**
   * Clean up abandoned games (timeout)
   */
  async cleanupAbandonedGames(timeoutMinutes = 10) {
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);

    const abandonedGames = await Game.updateMany(
      {
        status: 'active',
        lastMoveAt: { $lt: cutoffTime }
      },
      {
        status: 'abandoned'
      }
    );

    if (abandonedGames.modifiedCount > 0) {
      logger.info(`Cleaned up ${abandonedGames.modifiedCount} abandoned games`);
    }

    return abandonedGames.modifiedCount;
  }
}

export default new MatchmakingService();

