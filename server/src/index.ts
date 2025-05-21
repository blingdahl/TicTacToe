// If you see type errors, make sure to run:
// npm install express mysql2 uuid dotenv
// npm install --save-dev @types/express @types/node @types/uuid

import express from 'express';
import path from 'path';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import type { Request, Response, NextFunction } from 'express';

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

function serializeGameState(state: any) {
  return JSON.stringify(state);
}

function deserializeGameState(state: any) {
  return JSON.parse(state);
}

function gameRowToJson(gameRow: any, userId: string) {
  return {
    gameId: gameRow.id,
    player1: gameRow.player1,
    player2: gameRow.player2,
    state: deserializeGameState(gameRow.state),
    createdAt: gameRow.created_at,
    updatedAt: gameRow.updated_at,
    turn: gameRow.turn,
    isPlayerInGame: (userId === gameRow.player1 || userId === gameRow.player2),
    isPlayerTurn: (gameRow.turn === PLAYER_1 && userId === gameRow.player1) || (gameRow.turn === PLAYER_2 && userId === gameRow.player2),
    yourPlayer: (userId === gameRow.player1) ? PLAYER_1 : PLAYER_2
  };
}

async function getGameJson(gameId: string, playerId: string) {
  const gameRow = await getGameRow(gameId);
  return gameRowToJson(gameRow, playerId);
}

const DEFAULT_GAME_STATE = [
  ['', '', ''],
  ['', '', ''],
  ['', '', '']
];

const PLAYER_1 = 'player1';
const PLAYER_2 = 'player2';

// API: Find next game
app.post('/api/game/find', async (req, res) => {
  try {
    const { userId } = req.body;
    const [activeGameRowsForUser] = await pool.query<any[]>('SELECT * FROM Games WHERE (player1 = ? OR player2 = ?) AND turn <> "Done"', [userId, userId]);
    if (activeGameRowsForUser.length > 0) {
      res.json({ game: gameRowToJson(activeGameRowsForUser[0], userId) });
      return;
    }

    const [availableGameRows] = await pool.query<any[]>('SELECT * FROM Games WHERE player2 IS NULL AND player1 != ? AND turn = "player2"', [userId]);
    if (availableGameRows.length > 0) {
      await pool.query('UPDATE Games SET player2 = ? WHERE id = ?', [userId, availableGameRows[0].id]);
      const [rows] = await pool.query<any[]>('SELECT * FROM Games WHERE id = ?', [availableGameRows[0].id]);
      const game = rows[0];
      res.json({ game: gameRowToJson(game, userId) });
    } else {
      const [result] = await pool.query('INSERT INTO Games (player1, state, turn) VALUES (?, ?, ?)', [userId, serializeGameState(DEFAULT_GAME_STATE), PLAYER_1]);
      const insertId = (result as any).insertId;
      const [rows] = await pool.query<any[]>('SELECT * FROM Games WHERE id = ?', [insertId]);
      const game = rows[0];
      res.json({ game: gameRowToJson(game, userId) });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

async function getGameRow(gameId: string) {
  let [gameRows] = await pool.query<any[]>('SELECT * FROM Games WHERE id = ?', [gameId]);
  if (gameRows.length === 0) {
    throw new Error('Game not found');
  }
  return gameRows[0];
}

// API: Get the most recent game state.
app.post('/api/game/get', async (req, res) => {
  try {
    const {userId, gameId} = req.body;
    if (!userId || !gameId) {
      return res.status(400).json({ error: 'Missing userid or gameId' });
    }
    let game = await getGameJson(String(gameId), String(userId));
    res.json({ game });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API: Make a move
app.post('/api/game/move', async (req, res) => {
  try {
    const { userId, gameId, row, column } = req.body;
    let game = await getGameJson(gameId, userId);
    if (!game.isPlayerInGame) {
      throw new Error('Game not found');
    }
    if (!game.isPlayerTurn) {
      throw new Error('Not your turn');
    }
    if (game.state[row][column] !== '') {
      throw new Error('Cell already occupied');
    }
    game.state[row][column] = game.turn;
    game.turn = game.turn === PLAYER_1 ? PLAYER_2 : PLAYER_1;
    await pool.query('UPDATE Games SET state = ?, turn = ? WHERE id = ?', [serializeGameState(game.state), game.turn, gameId]);
    game = await getGameJson(gameId, userId);
    res.json({ game });
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