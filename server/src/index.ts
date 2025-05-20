// If you see type errors, make sure to run:
// npm install express mysql2 uuid dotenv
// npm install --save-dev @types/express @types/node @types/uuid

import express from 'express';
import path from 'path';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../../public')));

// Middleware to ensure userid in URL
app.use((req, res, next) => {
  const url = new URL(req.protocol + '://' + req.get('host') + req.originalUrl);
  let userid = url.searchParams.get('userid');
  if (!userid || !uuidValidate(userid)) {
    userid = uuidv4();
    url.searchParams.set('userid', userid);
    return res.redirect(url.pathname + '?' + url.searchParams.toString());
  }
  (req as any).userid = userid;
  next();
});

// API: Get current user
app.get('/api/user/current', (req, res) => {
  const userid = (req as any).userid;
  res.json({ userid });
});

// API: Find next game
app.post('/api/game/find', async (req, res) => {
  const { userid } = req.body;
  // TODO: Implement game matchmaking logic
  res.json({ gameId: 'dummy-game-id', message: 'Game found or created.' });
});

// API: Get the most recent move.
app.get('/api/game/get', async (req, res) => {
  const { userid, gameId } = req.query;
  // TODO: Implement check logic
  res.json({ moved: false });
});

// API: Make a move
app.post('/api/game/move', async (req, res) => {
  const { userid, gameId, move } = req.body;
  // TODO: Implement move logic
  res.json({ success: true });
});

// Root: Serve web UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 