import { Schema, model } from 'mongoose';

const gameSchema = new Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'abandoned'],
    default: 'waiting'
  },
  players: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    symbol: {
      type: String,
      enum: ['X', 'O']
    },
    socketId: String
  }],
  board: {
    type: [[String]],
    default: [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ]
  },
  currentTurn: {
    type: String,
    enum: ['X', 'O'],
    default: 'X'
  },
  winner: {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    symbol: String
  },
  isDraw: {
    type: Boolean,
    default: false
  },
  moves: [{
    player: String,
    symbol: String,
    position: {
      row: Number,
      col: Number
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  lastMoveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
gameSchema.index({ status: 1, createdAt: -1 });
gameSchema.index({ 'players.userId': 1 });

export default model('Game', gameSchema);

