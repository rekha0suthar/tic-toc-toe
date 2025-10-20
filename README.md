# 🎮 Multiplayer Tic-Tac-Toe Game

A fully-featured, server-authoritative multiplayer Tic-Tac-Toe game built for the LILA Backend Assignment. This project includes a real-time game server with matchmaking, leaderboards, and a cross-platform mobile application.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Socket Events](#socket-events)
- [Design Decisions](#design-decisions)
- [Future Enhancements](#future-enhancements)

## ✨ Features

### Core Features (Required)
- ✅ **Server-Authoritative Multiplayer**: All game logic runs on the server to prevent cheating
- ✅ **Real-time Communication**: Socket.IO for instant game updates
- ✅ **Matchmaking System**: Automatic opponent matching with queue management
- ✅ **Cloud Deployment**: Dockerized application ready for any cloud provider

### Bonus Features (Implemented)
- ✅ **Leaderboard System**: Track player rankings and performance
- ✅ **Multiple Simultaneous Games**: Server handles unlimited concurrent games
- ✅ **Player Statistics**: Win/loss records, win rates, and scoring system
- ✅ **Private Games**: Create and share game IDs with friends
- ✅ **Persistent Data**: MongoDB for game history and user profiles
- ✅ **Redis Caching**: Fast game state management
- ✅ **Comprehensive API**: RESTful endpoints for game and user data

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         ┌──────────────────────┐         ┌──────────────┐
│                 │         │                      │         │              │
│  React Native   │◄───────►│   Game Server        │◄───────►│   MongoDB    │
│  Mobile App     │ Socket  │   (Node.js/Express)  │         │   Database   │
│                 │         │                      │         │              │
└─────────────────┘         └──────────────────────┘         └──────────────┘
                                     │
                                     │
                            ┌────────▼────────┐
                            │                 │
                            │  Redis Cache    │
                            │  (Game State)   │
                            │                 │
                            └─────────────────┘
```

### Component Breakdown

#### Backend Server
- **Express.js**: RESTful API endpoints
- **Socket.IO**: WebSocket server for real-time communication
- **Game Engine**: Server-authoritative game logic with move validation
- **Matchmaking Service**: Queue management and game creation
- **Leaderboard Service**: Ranking calculation and statistics

#### Database Layer
- **MongoDB**: Persistent storage for users, games, and history
- **Redis**: In-memory cache for active game sessions (optional)

#### Mobile App
- **React Native + Expo**: Cross-platform mobile development
- **Socket.IO Client**: Real-time server communication
- **Context API**: State management for user and socket connections

## 🛠️ Technology Stack

### Backend
- **Node.js** (v18+)
- **Express.js** (v4.18+)
- **Socket.IO** (v4.6+)
- **MongoDB** (v7.0+)
- **Mongoose** (v8.0+)
- **Redis** (v4.6+) - Optional
- **Winston** - Logging
- **Joi** - Validation

### Mobile App
- **React Native** (v0.73+)
- **Expo** (v50+)
- **Socket.IO Client** (v4.6+)
- **React Navigation** (v6+)
- **AsyncStorage** - Local storage

### DevOps
- **Docker** & **Docker Compose**
- **GitHub Actions** (CI/CD ready)
- Cloud-agnostic deployment

## 📁 Project Structure

```
tic-toc-toe/
├── src/                          # Backend source code
│   ├── config/                   # Configuration files
│   │   ├── config.js            # Environment configuration
│   │   └── logger.js            # Winston logger setup
│   ├── models/                   # Database models
│   │   ├── User.js              # User schema
│   │   └── Game.js              # Game schema
│   ├── game/                     # Game logic
│   │   └── GameEngine.js        # Core game engine
│   ├── services/                 # Business logic
│   │   ├── MatchmakingService.js
│   │   └── LeaderboardService.js
│   ├── socket/                   # Socket.IO handlers
│   │   └── gameHandlers.js
│   ├── routes/                   # REST API routes
│   │   └── api.js
│   └── server.js                 # Main server file
├── mobile/                       # React Native app
│   ├── src/
│   │   ├── screens/             # App screens
│   │   ├── context/             # React Context providers
│   │   └── config/              # App configuration
│   ├── App.js                   # Root component
│   ├── app.json                 # Expo configuration
│   └── package.json
├── Dockerfile                    # Docker configuration
├── docker-compose.yml           # Docker Compose setup
├── package.json                 # Backend dependencies
└── README.md                    # This file
```

## 🚀 Installation

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud)
- **Expo CLI** (for mobile development)
- **Docker** (optional, for containerization)

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd tic-toc-toe
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see [Configuration](#configuration))

### Mobile App Setup

1. **Navigate to mobile directory**
```bash
cd mobile
```

2. **Install dependencies**
```bash
npm install
```

3. **Update server URL**
Edit `mobile/src/config/constants.js` with your server URL

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/tictactoe

# For MongoDB Atlas (Production)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tictactoe

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# CORS Configuration
CORS_ORIGIN=*

# Game Configuration
MAX_GAMES_PER_USER=3
GAME_TIMEOUT_MINUTES=10
MATCHMAKING_TIMEOUT_SECONDS=60
```

### Mobile App Configuration

Update `mobile/src/config/constants.js`:

```javascript
// For local development
export const API_URL = 'http://localhost:3000';

// For production (replace with your deployed server URL)
export const API_URL = 'https://your-server-url.com';
```

## 🏃 Running Locally

### Option 1: Traditional Setup

1. **Start MongoDB** (if running locally)
```bash
mongod
```

2. **Start the backend server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

3. **Start the mobile app**
```bash
cd mobile
expo start
```

4. **Scan QR code** with Expo Go app (iOS/Android)

### Option 2: Docker Compose (Recommended)

```bash
# Start all services (MongoDB, Redis, Server)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

The server will be available at `http://localhost:3000`

## 🌐 Deployment

### Deploying to Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku app**
```bash
heroku create your-app-name
```

4. **Add MongoDB Atlas**
```bash
heroku addons:create mongolab:sandbox
```

5. **Set environment variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set CORS_ORIGIN=*
```

6. **Deploy**
```bash
git push heroku main
```

### Deploying to AWS EC2

1. **Launch EC2 instance** (Ubuntu 22.04 LTS recommended)

2. **Connect to instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
```

4. **Clone repository**
```bash
git clone <repository-url>
cd tic-toc-toe
```

5. **Configure environment**
```bash
nano .env  # Edit with your configuration
```

6. **Run with Docker Compose**
```bash
docker-compose up -d
```

7. **Configure security group** to allow inbound traffic on port 3000

### Deploying to DigitalOcean

1. **Create Droplet** (Docker on Ubuntu)

2. **SSH into Droplet**
```bash
ssh root@your-droplet-ip
```

3. **Clone and setup** (same as AWS steps 4-6)

4. **Setup firewall**
```bash
ufw allow 3000
ufw enable
```

### Deploying Mobile App

#### iOS (TestFlight)
```bash
cd mobile
expo build:ios
# Follow Expo's instructions for TestFlight upload
```

#### Android (Google Play Beta)
```bash
cd mobile
expo build:android
# Upload .apk to Google Play Console
```

## 📡 API Documentation

### REST Endpoints

#### User Management

**Create/Get User**
```http
POST /api/users
Content-Type: application/json

{
  "username": "player1",
  "email": "player1@example.com"
}

Response: 200 OK
{
  "userId": "64f5a2b1c3d4e5f6a7b8c9d0",
  "username": "player1",
  "stats": { ... }
}
```

**Get User by ID**
```http
GET /api/users/:userId

Response: 200 OK
{
  "userId": "64f5a2b1c3d4e5f6a7b8c9d0",
  "username": "player1",
  "stats": { ... },
  "rank": 42,
  "isOnline": true
}
```

**Get User Stats**
```http
GET /api/users/:userId/stats

Response: 200 OK
{
  "rank": 42,
  "username": "player1",
  "gamesPlayed": 100,
  "gamesWon": 65,
  "gamesLost": 30,
  "gamesDraw": 5,
  "totalScore": 200,
  "winRate": 65.0
}
```

#### Game Management

**Get Game by ID**
```http
GET /api/games/:gameId

Response: 200 OK
{
  "gameId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "players": [ ... ],
  "board": [ ... ],
  "winner": { ... }
}
```

**Get User's Games**
```http
GET /api/users/:userId/games?status=active

Response: 200 OK
[ { game1 }, { game2 }, ... ]
```

#### Leaderboard

**Get Leaderboard**
```http
GET /api/leaderboard?limit=100

Response: 200 OK
[
  {
    "rank": 1,
    "username": "player1",
    "gamesPlayed": 150,
    "gamesWon": 120,
    "totalScore": 360,
    "winRate": 80.0
  },
  ...
]
```

**Get Leaderboard Around Player**
```http
GET /api/leaderboard/around/:userId?range=5

Response: 200 OK
[ { players around user } ]
```

**Get Statistics Summary**
```http
GET /api/stats/summary

Response: 200 OK
{
  "totalPlayers": 1000,
  "activePlayers": 750,
  "totalGames": 5000,
  "avgWinRate": 48.5
}
```

## 🔌 Socket Events

### Client → Server

**Join Matchmaking Queue**
```javascript
socket.emit('joinQueue', {
  userId: 'user-id',
  username: 'username'
});
```

**Leave Queue**
```javascript
socket.emit('leaveQueue', {
  userId: 'user-id'
});
```

**Create Private Game**
```javascript
socket.emit('createPrivateGame', {
  userId: 'user-id',
  username: 'username'
});
```

**Join Private Game**
```javascript
socket.emit('joinPrivateGame', {
  gameId: 'game-id',
  userId: 'user-id',
  username: 'username'
});
```

**Make Move**
```javascript
socket.emit('makeMove', {
  gameId: 'game-id',
  userId: 'user-id',
  row: 0,
  col: 1
});
```

**Get Leaderboard**
```javascript
socket.emit('getLeaderboard', {
  limit: 100
});
```

**Get Player Stats**
```javascript
socket.emit('getPlayerStats', {
  userId: 'user-id'
});
```

### Server → Client

**Queue Joined**
```javascript
socket.on('queueJoined', (data) => {
  // { position: 1, message: 'Searching...' }
});
```

**Game Found**
```javascript
socket.on('gameFound', (data) => {
  // {
  //   gameId: 'game-id',
  //   opponent: { userId, username, symbol },
  //   yourSymbol: 'X',
  //   board: [...],
  //   currentTurn: 'X'
  // }
});
```

**Game Started**
```javascript
socket.on('gameStarted', (data) => {
  // Same as gameFound
});
```

**Move Made**
```javascript
socket.on('moveMade', (data) => {
  // {
  //   board: [...],
  //   currentTurn: 'O',
  //   lastMove: { player, symbol, position },
  //   gameOver: false,
  //   winner: null,
  //   isDraw: false
  // }
});
```

**Error**
```javascript
socket.on('error', (error) => {
  // { message: 'Error description' }
});
```

**Leaderboard**
```javascript
socket.on('leaderboard', (data) => {
  // [ { rank, username, stats, ... }, ... ]
});
```

**Player Stats**
```javascript
socket.on('playerStats', (data) => {
  // { rank, username, gamesPlayed, ... }
});
```

## 🎯 Design Decisions

### 1. Server-Authoritative Architecture
**Decision**: All game logic runs on the server, not the client.

**Rationale**:
- Prevents cheating by validating all moves server-side
- Single source of truth for game state
- Easier to maintain consistency across clients

**Implementation**:
- `GameEngine.js` validates every move before applying
- Clients only send move intents, server applies them
- Server broadcasts validated game state to all players

### 2. Real-time Communication with Socket.IO
**Decision**: Use WebSockets (Socket.IO) instead of HTTP polling.

**Rationale**:
- Low latency for real-time gameplay
- Bidirectional communication
- Automatic reconnection handling
- Fallback to HTTP long-polling

**Trade-offs**:
- More complex than REST APIs
- Requires persistent connections
- Scaling requires sticky sessions or Redis adapter

### 3. MongoDB for Persistence
**Decision**: MongoDB with Mongoose ODM.

**Rationale**:
- Flexible schema for evolving game features
- Good performance for document-based data
- Easy integration with Node.js
- Scalable with sharding and replication

**Alternative Considered**: PostgreSQL (chosen MongoDB for faster prototyping)

### 4. Matchmaking Queue System
**Decision**: In-memory queue with database fallback.

**Rationale**:
- Fast matching (O(1) operations)
- Simple implementation for proof-of-concept
- Can be extended to Redis for multi-server deployment

**Future Enhancement**: Priority queues, skill-based matching, ELO ratings

### 5. Leaderboard Scoring System
**Decision**: Points-based system (Win: 3pts, Draw: 1pt, Loss: 0pt)

**Rationale**:
- Simple and intuitive
- Rewards wins heavily
- Encourages aggressive play
- Standard in competitive games

**Formula**: 
- Primary sort: Total Score
- Secondary sort: Win Rate %

### 6. React Native + Expo
**Decision**: Expo framework for mobile development.

**Rationale**:
- Single codebase for iOS and Android
- Rapid development with hot reloading
- Easy OTA updates
- Built-in components and APIs

**Trade-offs**:
- Larger app size
- Limited native module access (not an issue for this project)

### 7. Docker Containerization
**Decision**: Dockerize the entire stack.

**Rationale**:
- Consistent development and production environments
- Easy deployment to any cloud provider
- Service isolation and scaling
- One-command setup with Docker Compose

## 🔄 Game Flow

### Matchmaking Flow
```
1. Player opens app → Login/Register
2. Click "Quick Play" → Join matchmaking queue
3. Server finds opponent → Create game
4. Both players notified → Navigate to game screen
5. Game starts with random X/O assignment
```

### Gameplay Flow
```
1. Player X makes first move
2. Client sends move to server
3. Server validates move
4. Server updates game state
5. Server broadcasts to both players
6. Check win/draw condition
7. If game continues → Switch turn to O
8. Repeat until game ends
9. Update player stats and leaderboard
10. Show result modal
```

### Error Handling
- Invalid moves rejected with error message
- Disconnection handled gracefully
- Game abandoned after 10 minutes of inactivity
- Automatic reconnection on network recovery

## 🚀 Future Enhancements

### Short-term (MVP+)
- [ ] Chat system between players
- [ ] Game history and replay
- [ ] Friend system and invites
- [ ] Custom room codes
- [ ] Spectator mode

### Mid-term
- [ ] ELO rating system
- [ ] Tournament mode
- [ ] Daily challenges
- [ ] Achievements and badges
- [ ] Custom themes and avatars

### Long-term
- [ ] AI opponent (single-player mode)
- [ ] Different board sizes (4x4, 5x5)
- [ ] Power-ups and special moves
- [ ] Seasonal leagues
- [ ] Mobile push notifications
- [ ] Web version (React.js)

### Scaling Improvements
- [ ] Redis adapter for Socket.IO clustering
- [ ] Horizontal scaling with load balancer
- [ ] Database sharding
- [ ] CDN for static assets
- [ ] Microservices architecture
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Monitoring (Prometheus + Grafana)

## 🧪 Testing

### Running Tests
```bash
# Backend tests
npm test

# Coverage report
npm run test:coverage
```

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Matchmaking queue join/leave
- [ ] Game creation and joining
- [ ] Valid moves accepted
- [ ] Invalid moves rejected
- [ ] Win detection (rows, columns, diagonals)
- [ ] Draw detection
- [ ] Leaderboard updates
- [ ] Stats tracking
- [ ] Disconnection handling
- [ ] Multiple concurrent games

## 📊 Performance Metrics

### Target Metrics
- **Response Time**: < 50ms for move validation
- **Matchmaking**: < 5s average wait time
- **Concurrent Games**: Support 1000+ simultaneous games
- **Database Queries**: < 100ms average
- **Memory Usage**: < 500MB per instance

### Monitoring
- Winston logging for error tracking
- Health check endpoint: `/health`
- Custom metrics can be added with Prometheus

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is created for the LILA Backend Assignment.

## 👤 Author

**LILA Assignment Submission**

## 🙏 Acknowledgments

- LILA Engineering Team for the assignment
- Socket.IO documentation and community
- React Native and Expo teams
- MongoDB and Node.js communities

---

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ for LILA Engineering**

