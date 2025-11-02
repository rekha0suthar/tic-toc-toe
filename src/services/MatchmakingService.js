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
   * Get active game by gameId
   */
  async getGame(gameId) {
    let game = this.activeGames.get(gameId);

    if (!game) {
      game = await Game.findOne({ gameId, status: 'active' });
      if (game) {
        this.activeGames.set(gameId, game);
      }
    }

    return game;
  }

}

export default new MatchmakingService();

