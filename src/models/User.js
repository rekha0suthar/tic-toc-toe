import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  socketId: {
    type: String,
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  stats: {
    gamesPlayed: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    gamesDraw: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 }
  },
  rank: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Calculate win rate before saving
userSchema.pre('save', function (next) {
  if (this.stats.gamesPlayed > 0) {
    this.stats.winRate = (this.stats.gamesWon / this.stats.gamesPlayed) * 100;
  }
  next();
});

// Instance method to update stats
userSchema.methods.updateStats = function (result) {
  this.stats.gamesPlayed += 1;

  if (result === 'win') {
    this.stats.gamesWon += 1;
    this.stats.totalScore += 3;
  } else if (result === 'loss') {
    this.stats.gamesLost += 1;
  } else if (result === 'draw') {
    this.stats.gamesDraw += 1;
    this.stats.totalScore += 1;
  }

  this.stats.winRate = (this.stats.gamesWon / this.stats.gamesPlayed) * 100;
  this.lastActive = Date.now();

  return this.save();
};

export default model('User', userSchema);

