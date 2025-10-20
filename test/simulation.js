/**
 * 🎮 Multi-User Game Simulation
 * 
 * This script simulates multiple users playing Tic-Tac-Toe simultaneously
 * to test server capacity and matchmaking
 */

import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3000';
const NUM_PLAYERS = 10; // Number of bot players to simulate
const MOVE_DELAY = 1000; // Delay between moves (ms)

class BotPlayer {
  constructor(id) {
    this.id = id;
    this.username = `Bot_${id}`;
    this.socket = null;
    this.userId = null;
    this.inGame = false;
    this.gameId = null;
    this.mySymbol = null;
    this.currentTurn = null;
    this.board = [['', '', ''], ['', '', ''], ['', '', '']];
    this.movesCount = 0;
    this.gamesPlayed = 0;
    this.wins = 0;
    this.losses = 0;
    this.draws = 0;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      console.log(`🤖 [${this.username}] Connecting...`);
      
      this.socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log(`✅ [${this.username}] Connected!`);
        this.setupListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error(`❌ [${this.username}] Connection error:`, error.message);
        reject(error);
      });

      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
  }

  setupListeners() {
    this.socket.on('gameFound', (data) => {
      this.inGame = true;
      this.gameId = data.gameId;
      this.mySymbol = data.yourSymbol;
      this.currentTurn = data.currentTurn;
      this.board = data.board;
      
      console.log(`🎮 [${this.username}] Game found! Playing as ${this.mySymbol} vs ${data.opponent.username}`);
      
      // Make first move if it's our turn
      setTimeout(() => this.makeMove(), MOVE_DELAY);
    });

    this.socket.on('moveMade', (data) => {
      this.board = data.board;
      this.currentTurn = data.currentTurn;
      this.movesCount++;

      if (data.gameOver) {
        this.handleGameEnd(data);
      } else if (this.currentTurn === this.mySymbol && this.inGame) {
        // Our turn, make a move
        setTimeout(() => this.makeMove(), MOVE_DELAY);
      }
    });

    this.socket.on('gameEnded', (data) => {
      console.log(`🏁 [${this.username}] Game ended: ${data.message}`);
      this.resetGame();
    });

    this.socket.on('error', (data) => {
      console.error(`⚠️  [${this.username}] Error: ${data.message}`);
    });

    this.socket.on('queueJoined', (data) => {
      console.log(`⏳ [${this.username}] In queue, position: ${data.position}`);
    });
  }

  async register() {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(`${SERVER_URL}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: this.username }),
        });

        const data = await response.json();
        this.userId = data.userId;
        console.log(`📝 [${this.username}] Registered with ID: ${this.userId}`);
        resolve();
      } catch (error) {
        console.error(`❌ [${this.username}] Registration failed:`, error.message);
        reject(error);
      }
    });
  }

  joinMatchmaking() {
    console.log(`🔍 [${this.username}] Joining matchmaking...`);
    this.socket.emit('joinQueue', {
      userId: this.userId,
      username: this.username,
    });
  }

  makeMove() {
    if (!this.inGame || this.currentTurn !== this.mySymbol) return;

    // Find empty cells
    const emptyCells = [];
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (this.board[row][col] === '') {
          emptyCells.push({ row, col });
        }
      }
    }

    if (emptyCells.length === 0) return;

    // Make random move
    const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    
    console.log(`🎯 [${this.username}] Making move at (${move.row}, ${move.col})`);
    this.socket.emit('makeMove', {
      gameId: this.gameId,
      userId: this.userId,
      row: move.row,
      col: move.col,
    });
  }

  handleGameEnd(data) {
    this.gamesPlayed++;
    
    if (data.isDraw) {
      this.draws++;
      console.log(`🤝 [${this.username}] Game ended in DRAW! (${this.gamesPlayed} games played)`);
    } else if (data.winner.userId === this.userId) {
      this.wins++;
      console.log(`🏆 [${this.username}] WON the game! (W:${this.wins} L:${this.losses} D:${this.draws})`);
    } else {
      this.losses++;
      console.log(`💔 [${this.username}] LOST the game! (W:${this.wins} L:${this.losses} D:${this.draws})`);
    }

    this.resetGame();

    // Join queue again for next game
    setTimeout(() => {
      if (this.socket.connected) {
        this.joinMatchmaking();
      }
    }, 2000);
  }

  resetGame() {
    this.inGame = false;
    this.gameId = null;
    this.mySymbol = null;
    this.currentTurn = null;
    this.board = [['', '', ''], ['', '', ''], ['', '', '']];
    this.movesCount = 0;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      console.log(`👋 [${this.username}] Disconnected`);
    }
  }

  getStats() {
    return {
      username: this.username,
      gamesPlayed: this.gamesPlayed,
      wins: this.wins,
      losses: this.losses,
      draws: this.draws,
      winRate: this.gamesPlayed > 0 ? ((this.wins / this.gamesPlayed) * 100).toFixed(1) : 0,
    };
  }
}

// Simulation Manager
class SimulationManager {
  constructor(numPlayers) {
    this.players = [];
    this.numPlayers = numPlayers;
    this.startTime = null;
  }

  async start() {
    console.log('🚀 Starting Simulation...\n');
    console.log(`👥 Creating ${this.numPlayers} bot players...\n`);

    this.startTime = Date.now();

    // Create and connect all bots
    for (let i = 1; i <= this.numPlayers; i++) {
      const bot = new BotPlayer(i);
      this.players.push(bot);

      try {
        await bot.connect();
        await bot.register();
        
        // Stagger queue joins to avoid all joining at exact same time
        setTimeout(() => bot.joinMatchmaking(), i * 200);
      } catch (error) {
        console.error(`Failed to initialize bot ${i}:`, error.message);
      }
    }

    console.log(`\n✅ All ${this.players.length} bots initialized!\n`);
    console.log('🎮 Games starting...\n');
    console.log('═'.repeat(80));
    console.log('\n');

    // Show stats every 10 seconds
    this.statsInterval = setInterval(() => this.showStats(), 10000);
  }

  showStats() {
    const totalGames = this.players.reduce((sum, bot) => sum + bot.gamesPlayed, 0);
    const totalWins = this.players.reduce((sum, bot) => sum + bot.wins, 0);
    const totalLosses = this.players.reduce((sum, bot) => sum + bot.losses, 0);
    const totalDraws = this.players.reduce((sum, bot) => sum + bot.draws, 0);
    const activeGames = this.players.filter(bot => bot.inGame).length / 2;
    const runtime = ((Date.now() - this.startTime) / 1000).toFixed(0);

    console.log('\n' + '═'.repeat(80));
    console.log(`📊 SIMULATION STATS (Runtime: ${runtime}s)`);
    console.log('═'.repeat(80));
    console.log(`🎮 Total Games Completed: ${totalGames / 2} (each game has 2 players)`);
    console.log(`🏃 Active Games: ${activeGames}`);
    console.log(`🏆 Total Wins: ${totalWins}`);
    console.log(`💔 Total Losses: ${totalLosses}`);
    console.log(`🤝 Total Draws: ${totalDraws}`);
    console.log(`👥 Active Players: ${this.players.filter(b => b.socket?.connected).length}/${this.numPlayers}`);
    console.log('═'.repeat(80));

    // Show top 5 players
    const sorted = this.players
      .map(b => b.getStats())
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 5);

    console.log('\n🏆 TOP 5 PLAYERS:');
    sorted.forEach((stats, i) => {
      console.log(`${i + 1}. ${stats.username}: ${stats.wins}W ${stats.losses}L ${stats.draws}D (${stats.winRate}% win rate)`);
    });
    console.log('\n');
  }

  async stop() {
    console.log('\n🛑 Stopping simulation...\n');
    
    clearInterval(this.statsInterval);
    
    // Show final stats
    this.showStats();

    // Disconnect all bots
    this.players.forEach(bot => bot.disconnect());

    console.log('✅ Simulation complete!\n');
    process.exit(0);
  }
}

// Run simulation
async function main() {
  const simulation = new SimulationManager(NUM_PLAYERS);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await simulation.stop();
  });

  try {
    await simulation.start();
  } catch (error) {
    console.error('❌ Simulation failed:', error);
    process.exit(1);
  }
}

main();

