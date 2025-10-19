import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import { cors as _cors, env, mongodb, port } from './config/config.js';
import logger from './config/logger.js';
import gameHandlers from './socket/gameHandlers.js';
import apiRoutes from './routes/api.js';

// Create Express app
const app = express();
const server = createServer(app);

// Configure Socket.IO
const io = new Server(server, {
  cors: {
    origin: _cors.origin,
    methods: ['GET', 'POST'],
    credentials: _cors.credentials
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors(_cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env
  });
});

// API Routes
app.use('/api', apiRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`New client connected: ${socket.id}`);

  // Register game handlers
  gameHandlers(io, socket);

  socket.on('error', (error) => {
    logger.error(`Socket error for ${socket.id}:`, error);
  });
});

// Connect to MongoDB
mongoose.connect(mongodb.uri, mongodb.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start server
    server.listen(port, () => {
      logger.info(`Server running on port ${port} in ${env} mode`);
      logger.info(`WebSocket server ready`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  
  // Close Socket.IO connections
  io.close(() => {
    logger.info('Socket.IO connections closed');
  });

  // Close MongoDB connection
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');

  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default { app, server, io };

