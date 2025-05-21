import { Pool } from 'mysql2/promise';

export class GameDb {
  private static instance: GameDb | null = null;
  private pool: Pool;

  private constructor(pool: Pool) {
    this.pool = pool;
  }

  static setInstanceForTest(instance: GameDb) {
    GameDb.instance = instance;
  }

  static getInstance(pool?: Pool): GameDb {
    if (!GameDb.instance) {
      if (!pool) throw new Error('Pool must be provided on first call to getInstance');
      GameDb.instance = new GameDb(pool);
    }
    return GameDb.instance;
  }

  // Fetch a game row by ID
  async getGameRow(gameId: string) {
    let [gameRows] = await this.pool.query<any[]>('SELECT * FROM Games WHERE id = ?', [gameId]);
    if (gameRows.length === 0) {
      throw new Error('Game not found');
    }
    return gameRows[0];
  }

  // Find an active game for a user (not finished)
  async findActiveGamesForUser(userId: string) {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM Games WHERE (player1 = ? OR player2 = ?) AND winner IS NULL',
      [userId, userId]
    );
    return rows;
  }

  // Find a game waiting for a second player
  async findAvailableGameToJoin(userId: string) {
    const [rows] = await this.pool.query<any[]>(
      'SELECT * FROM Games WHERE player2 IS NULL AND player1 != ? AND turn = "player2"',
      [userId]
    );
    return rows;
  }

  // Join a game as player2
  async joinGame(userId: string, gameId: string) {
    await this.pool.query('UPDATE Games SET player2 = ? WHERE id = ?', [userId, gameId]);
  }

  // Create a new game
  async createGame(userId: string, serializedState: string, turn: string) {
    const [result] = await this.pool.query('INSERT INTO Games (player1, state, turn) VALUES (?, ?, ?)', [userId, serializedState, turn]);
    return (result as any).insertId;
  }

  // Update game state and turn
  async updateGameState(gameId: string, serializedState: string, turn: string) {
    await this.pool.query('UPDATE Games SET state = ?, turn = ? WHERE id = ?', [serializedState, turn, gameId]);
  }

  // Set winner for a game
  async setGameWinner(gameId: string, winner: string) {
    await this.pool.query('UPDATE Games SET winner = ? WHERE id = ?', [winner, gameId]);
  }
}

