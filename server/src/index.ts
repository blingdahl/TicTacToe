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

// Serve static files (client build)
app.use(express.static(path.join(__dirname, '../../client/build')));

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

// Example API endpoint
app.get('/api/data', async (req, res) => {
  const output = req.query.output;
  const userid = (req as any).userid;
  // Example: fetch user data from MySQL
  // const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [userid]);
  const data = { userid, message: 'Hello from the API!' };
  if (output === 'json') {
    return res.json(data);
  } else {
    // Render a simple HTML page
    return res.send(`<html><body><h1>Hello, user ${userid}!</h1><p>This is the web UI.</p></body></html>`);
  }
});

// Fallback: serve client app (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 