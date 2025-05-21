// If you see type errors, make sure to run:
// npm install express mysql2 uuid dotenv
// npm install --save-dev @types/express @types/node @types/uuid

import express from 'express';
import path from 'path';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import type { Request, Response, NextFunction } from 'express';
import {
 Game
} from './game';
import {
  GameDb
} from './gamedb';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;


// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const gameDb = GameDb.getInstance(pool);

// Middleware to parse JSON
app.use(express.json());

// Middleware to ensure userId is set in POST requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    if (!req.body || !req.body.userId) {
      return res.status(400).json({ error: 'Missing userId in request body' });
    }
  }
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../../public')));

// API: Find next game
app.post('/api/game/find', async (req, res) => {
  try {
    const { userId } = req.body;
    const activeGameRowsForUser = await gameDb.findActiveGamesForUser(userId);
    if (activeGameRowsForUser.length > 0) {
      res.json({ game: Game.fromRow(activeGameRowsForUser[0]).getJson(userId) });
      return;
    }

    const availableGameRows = await gameDb.findAvailableGameToJoin(userId);
    if (availableGameRows.length > 0) {
      await gameDb.joinGame(userId, availableGameRows[0].id);
      const gameRow = await gameDb.getGameById(availableGameRows[0].id);
      res.json({ game: Game.fromRow(gameRow).getJson(userId) });
    } else {
      const insertId = await gameDb.createGame(userId, Game.serializeGameState(Game.DEFAULT_GAME_STATE), Game.PLAYER_1);
      const game = await gameDb.getGameById(insertId);
      res.json({ game: Game.fromRow(activeGameRowsForUser[0]).getJson(userId) });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get the most recent game state.
app.post('/api/game/get', async (req, res) => {
  try {
    const {userId, gameId} = req.body;
    if (!userId || !gameId) {
      return res.status(400).json({ error: 'Missing userid or gameId' });
    }
    const gameRow = await gameDb.getGameRow(String(gameId));
    res.json({ game: Game.fromRow(gameRow).getJson(userId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Make a move
app.post('/api/game/move', async (req, res) => {
  try {
    const { userId, gameId, row, column } = req.body;
    let gameRow = await gameDb.getGameRow(String(gameId));
    let game = Game.fromRow(gameRow);
    if (!game.isPlayerInGame(userId)) {
      throw new Error('Game not found');
    }
    if (!game.isPlayerTurn(userId)) {
      throw new Error('Not your turn');
    }
    if (game.state[row][column] !== '') {
      throw new Error('Cell already occupied');
    }
    game.state[row][column] = game.turn;
    game.turn = game.turn === Game.PLAYER_1 ? Game.PLAYER_2 : Game.PLAYER_1;
    await gameDb.updateGameState(gameId, Game.serializeGameState(game.state), game.turn);
    let winner = game.getWinner();
    if (winner) {
      await gameDb.setGameWinner(gameId, winner);
    }
    gameRow = await gameDb.getGameRow(gameId);
    res.json({ game: Game.fromRow(gameRow).getJson(userId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Root: Serve web UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 