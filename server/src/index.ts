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
import {
  GameController
} from './gamecontroller';

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

const gameController = new GameController(gameDb);

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

async function writeGame(gamePromise: Promise<Game>, userId: string, res: Response) {
  let game = await gamePromise;
  res.json({ game: game.getJson(userId) });
}

// API: Find next game
app.post('/api/game/find', async (req, res) => {
  try {
    const { userId } = req.body;
    await writeGame(gameController.findGame(userId), userId, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Get the most recent game state.
app.post('/api/game/get', async (req, res) => {
  try {
    const {userId, gameId} = req.body;
    await writeGame(gameController.getGame(userId, gameId), userId, res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Make a move
app.post('/api/game/move', async (req, res) => {
  try {
    const { userId, gameId, row, column } = req.body;
    await writeGame(gameController.makeMove(userId, gameId, row, column), userId, res);
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