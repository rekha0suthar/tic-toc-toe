import User from '../models/User.js';
import GameEngine from '../game/GameEngine.js';
import MatchmakingService from '../services/MatchmakingService.js';
import LeaderboardService from '../services/LeaderboardService.js';
import logger from '../config/logger.js';

export default (io, socket) => {
  /**
   * Player joins matchmaking queue
   */
  socket.on('joinQueue', async (data) => {
    try {
      const { userId, username } = data;

      logger.info(`Player ${username} (${userId}) joining queue`);

      // Update user socket and online status
      await User.findByIdAndUpdate(userId, {
        socketId: socket.id,
        isOnline: true,
        lastActive: Date.now()
      });

      // Add to matchmaking queue
      const result = await MatchmakingService.addToQueue(userId, username, socket.id);

      if (result.matched) {
        // Game found immediately
        const game = result.game;

        // Join both players to game room for faster broadcasting
        const player1Socket = io.sockets.sockets.get(game.players[0].socketId);
        const player2Socket = io.sockets.sockets.get(game.players[1].socketId);

        if (player1Socket) player1Socket.join(game.gameId);
        if (player2Socket) player2Socket.join(game.gameId);

        // Notify both players
        io.to(game.players[0].socketId).emit('gameFound', {
          gameId: game.gameId,
          opponent: game.players[1],
          yourSymbol: game.players[0].symbol,
          board: game.board,
          currentTurn: game.currentTurn
        });

        io.to(game.players[1].socketId).emit('gameFound', {
          gameId: game.gameId,
          opponent: game.players[0],
          yourSymbol: game.players[1].symbol,
          board: game.board,
          currentTurn: game.currentTurn
        });

        logger.info(`Match found: ${game.players[0].username} vs ${game.players[1].username}`);
      } else {
        socket.emit('queueJoined', {
          position: result.queuePosition,
          message: 'Searching for opponent...'
        });
      }
    } catch (error) {
      logger.error('Error joining queue:', error);
      socket.emit('error', { message: 'Failed to join queue' });
    }
  });

  /**
   * Player leaves matchmaking queue
   */
  socket.on('leaveQueue', async (data) => {
    try {
      const { userId } = data;
      MatchmakingService.removeFromQueue(userId);
      socket.emit('queueLeft', { message: 'Left matchmaking queue' });
      logger.info(`Player ${userId} left queue`);
    } catch (error) {
      logger.error('Error leaving queue:', error);
      socket.emit('error', { message: 'Failed to leave queue' });
    }
  });


  /**
   * Player makes a move
   */
  socket.on('makeMove', async (data) => {
    try {
      const { gameId, userId, row, col } = data;

      logger.info(`Move attempt: Game ${gameId}, User ${userId}, Position (${row}, ${col})`);

      // Get game from database
      const game = await MatchmakingService.getGame(gameId);

      if (!game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      if (game.status !== 'active') {
        socket.emit('error', { message: 'Game is not active' });
        return;
      }

      // Ensure player is in the game room (handles reconnections)
      socket.join(gameId);

      // Process move with game engine
      const result = GameEngine.processMove(game, userId, row, col);

      if (!result.success) {
        socket.emit('error', { message: result.error });
        return;
      }

      // Prepare move data for broadcasting
      const moveData = {
        board: result.board,
        currentTurn: result.currentTurn,
        lastMove: result.move,
        gameOver: result.gameOver,
        winner: result.winner,
        isDraw: result.isDraw
      };

      // BROADCAST IMMEDIATELY to game room for low latency
      io.to(gameId).emit('moveMade', moveData);

      // Update game in database (async - don't block)
      game.board = result.board;
      game.currentTurn = result.currentTurn;
      game.lastMoveAt = Date.now();
      game.moves.push(result.move);

      if (result.gameOver) {
        game.status = 'completed';
        game.completedAt = Date.now();
        game.isDraw = result.isDraw;

        if (result.winner) {
          game.winner = result.winner;
        }

        // Save game and update stats asynchronously
        game.save().then(async () => {
          // Update player stats in background
          for (const player of game.players) {
            const user = await User.findById(player.userId);
            if (user) {
              if (result.isDraw) {
                await user.updateStats('draw');
              } else if (result.winner.userId.toString() === player.userId.toString()) {
                await user.updateStats('win');
              } else {
                await user.updateStats('loss');
              }
            }
          }

          // Update leaderboard ranks in background (don't block)
          LeaderboardService.updateAllRanks().catch(err =>
            logger.error('Error updating ranks:', err)
          );
        }).catch(err => logger.error('Error saving game:', err));
      } else {
        // Save game asynchronously for non-ending moves
        game.save().catch(err => logger.error('Error saving game:', err));
      }

      if (result.gameOver) {
        logger.info(`Game ${gameId} ended. Winner: ${result.winner ? result.winner.username : 'Draw'}`);
      }
    } catch (error) {
      logger.error('Error making move:', error);
      socket.emit('error', { message: 'Failed to make move' });
    }
  });

  /**
   * Player disconnects
   */
  socket.on('disconnect', async () => {
    try {
      logger.info(`Socket ${socket.id} disconnected`);

      // Update user status
      const user = await User.findOne({ socketId: socket.id });

      if (user) {
        user.isOnline = false;
        user.lastActive = Date.now();
        await user.save();

        // Remove from queue
        MatchmakingService.removeFromQueue(user._id.toString());

        logger.info(`User ${user.username} went offline`);
      }
    } catch (error) {
      logger.error('Error handling disconnect:', error);
    }
  });

};

