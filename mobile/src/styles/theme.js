// Dark Theme Design System - Based on Reference Images
export const colors = {
  // Primary - Dark Navy Background
  background: '#1a2332',
  backgroundDark: '#141b27',
  backgroundLight: '#1f2937',
  
  // Accent Colors
  cyan: '#00d9ff', // Player X
  purple: '#a78bfa', // Player O  
  orange: '#fbbf24', // You indicator
  
  // Gradients
  cyanGradient: ['#00d9ff', '#00b8d9'],
  purpleGradient: ['#a78bfa', '#8b5cf6'],
  orangeGradient: ['#fbbf24', '#f59e0b'],
  
  // UI Colors
  primary: '#00d9ff',
  secondary: '#a78bfa',
  accent: '#00d9ff',
  
  // Status
  success: '#10b981',
  error: '#ef4444',
  warning: '#fbbf24',
  
  // Text
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  textMuted: '#6b7280',
  
  // Borders
  border: '#2d3748',
  borderLight: '#374151',
  borderDark: '#1f2937',
  
  // Card/Surface
  card: '#1f2937',
  cardLight: '#2d3748',
  
  // Player specific
  playerX: '#00d9ff',
  playerO: '#a78bfa',
  playerYou: '#fbbf24',
  
  // Game board
  boardBackground: '#1a2332',
  boardGrid: '#2d3748',
  cellEmpty: 'transparent',
  cellHover: 'rgba(0, 217, 255, 0.1)',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Special
  white: '#ffffff',
  black: '#000000',
};

export const typography = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 48,
  
  // Font weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  // Glow effects
  cyan: {
    shadowColor: '#00d9ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  purple: {
    shadowColor: '#a78bfa',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
};

