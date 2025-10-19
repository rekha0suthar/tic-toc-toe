import logger from '../config/logger.js';

class GameEngine {
  constructor() {
    this.boardSize = 3;
  }

  /**
   * Create a new empty board
   */
  createBoard() {
    return Array(this.boardSize).fill(null).map(() => Array(this.boardSize).fill(''));
  }

  /**
   * Validate a move
   */
  validateMove(board, row, col, currentTurn, playerSymbol) {
    // Check if it's player's turn
    if (currentTurn !== playerSymbol) {
      return { valid: false, error: 'Not your turn' };
    }

    // Check if position is valid
    if (row < 0 || row >= this.boardSize || col < 0 || col >= this.boardSize) {
      return { valid: false, error: 'Invalid position' };
    }

    // Check if cell is empty
    if (board[row][col] !== '') {
      return { valid: false, error: 'Cell already occupied' };
    }

    return { valid: true };
  }

  /**
   * Make a move on the board
   */
  makeMove(board, row, col, symbol) {
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = symbol;
    return newBoard;
  }

  /**
   * Check if there's a winner
   */
  checkWinner(board) {
    // Check rows
    for (let i = 0; i < this.boardSize; i++) {
      if (board[i][0] !== '' && 
          board[i][0] === board[i][1] && 
          board[i][1] === board[i][2]) {
        return {
          winner: board[i][0],
          winningLine: [
            { row: i, col: 0 },
            { row: i, col: 1 },
            { row: i, col: 2 }
          ]
        };
      }
    }

    // Check columns
    for (let i = 0; i < this.boardSize; i++) {
      if (board[0][i] !== '' && 
          board[0][i] === board[1][i] && 
          board[1][i] === board[2][i]) {
        return {
          winner: board[0][i],
          winningLine: [
            { row: 0, col: i },
            { row: 1, col: i },
            { row: 2, col: i }
          ]
        };
      }
    }

    // Check diagonal (top-left to bottom-right)
    if (board[0][0] !== '' && 
        board[0][0] === board[1][1] && 
        board[1][1] === board[2][2]) {
      return {
        winner: board[0][0],
        winningLine: [
          { row: 0, col: 0 },
          { row: 1, col: 1 },
          { row: 2, col: 2 }
        ]
      };
    }

    // Check diagonal (top-right to bottom-left)
    if (board[0][2] !== '' && 
        board[0][2] === board[1][1] && 
        board[1][1] === board[2][0]) {
      return {
        winner: board[0][2],
        winningLine: [
          { row: 0, col: 2 },
          { row: 1, col: 1 },
          { row: 2, col: 0 }
        ]
      };
    }

    return null;
  }

  /**
   * Check if the board is full (draw)
   */
  isBoardFull(board) {
    for (let i = 0; i < this.boardSize; i++) {
      for (let j = 0; j < this.boardSize; j++) {
        if (board[i][j] === '') {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get the next turn
   */
  getNextTurn(currentTurn) {
    return currentTurn === 'X' ? 'O' : 'X';
  }

  /**
   * Process a move and return the game state
   */
  processMove(gameState, userId, row, col) {
    const { board, currentTurn, players } = gameState;

    // Find player
    const player = players.find(p => p.userId.toString() === userId.toString());
    if (!player) {
      return { success: false, error: 'Player not in game' };
    }

    // Validate move
    const validation = this.validateMove(board, row, col, currentTurn, player.symbol);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Make the move
    const newBoard = this.makeMove(board, row, col, player.symbol);

    // Check for winner
    const winResult = this.checkWinner(newBoard);
    let gameOver = false;
    let winner = null;
    let isDraw = false;

    if (winResult) {
      gameOver = true;
      winner = players.find(p => p.symbol === winResult.winner);
      logger.info(`Game over - Winner: ${winner.username} (${winner.symbol})`);
    } else if (this.isBoardFull(newBoard)) {
      gameOver = true;
      isDraw = true;
      logger.info('Game over - Draw');
    }

    // Get next turn
    const nextTurn = gameOver ? currentTurn : this.getNextTurn(currentTurn);

    return {
      success: true,
      board: newBoard,
      currentTurn: nextTurn,
      gameOver,
      winner: winner ? {
        userId: winner.userId,
        username: winner.username,
        symbol: winner.symbol,
        winningLine: winResult?.winningLine
      } : null,
      isDraw,
      move: {
        player: player.username,
        symbol: player.symbol,
        position: { row, col }
      }
    };
  }
}

export default new GameEngine();

