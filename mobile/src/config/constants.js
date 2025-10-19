// Update these URLs based on your deployment
// For mobile development, use your computer's IP address instead of localhost
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.19:3000';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://192.168.1.19:3000';

// Game Constants
export const BOARD_SIZE = 3;
export const WIN_CONDITION = 3;

// Scoring
export const SCORE_WIN = 3;
export const SCORE_DRAW = 1;
export const SCORE_LOSS = 0;

