import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 3000;
export const env = process.env.NODE_ENV || 'development';
export const mongodb = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tictactoe',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};
export const cors = {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
};
export const game = {
  maxGamesPerUser: parseInt(process.env.MAX_GAMES_PER_USER) || 3,
  gameTimeoutMinutes: parseInt(process.env.GAME_TIMEOUT_MINUTES) || 10,
  matchmakingTimeoutSeconds: parseInt(process.env.MATCHMAKING_TIMEOUT_SECONDS) || 60,
  boardSize: 3,
  winCondition: 3
};

