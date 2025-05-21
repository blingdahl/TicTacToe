import { Pool } from 'mysql2/promise';

class Coordinates {
  row: number;
  col: number;

  constructor(row: number, col: number) {
    this.row = row;
    this.col = col;
  }
}

export class Game {
  static DEFAULT_GAME_STATE: string[][] = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
  ];

  static PLAYER_1 = 'player1';
  static PLAYER_2 = 'player2';

  id: number;
  player1: string;
  player2: string | null;
  state: string[][];
  turn: string;
  winner: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(id: number, player1: string, player2: string | null, state: string[][], turn: string, winner: string | null, createdAt: string, updatedAt: string) {
    this.id = id;
    this.player1 = player1;
    this.player2 = player2;
    this.state = state;
    this.turn = turn;
    this.winner = winner;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromRow(gameRow: any): Game {
    return new Game(gameRow.id, gameRow.player1, gameRow.player2, Game.deserializeGameState(gameRow.state), gameRow.turn, gameRow.winner, gameRow.created_at, gameRow.updated_at);
  }

  static serializeGameState(state: string[][]): string {
    return JSON.stringify(state);
  }

  static deserializeGameState(state: string | string[][]): string[][] {
    if (typeof state === 'string') {
      return JSON.parse(state);
    }
    return state;
  }

  isPlayerInGame(userId: string) {
    return userId === this.player1 || userId === this.player2;
  }

  yourPlayer(userId: string) {
    return (userId === this.player1) ? Game.PLAYER_1 : Game.PLAYER_2;
  }

  toggleTurn() {
    this.turn = this.turn === Game.PLAYER_1 ? Game.PLAYER_2 : Game.PLAYER_1;
  }

  getJson(userId: string) {
    return {
      gameId: this.id,
      player1: this.player1,
      player2: this.player2,
      state: this.state,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      turn: this.turn,
      isPlayerInGame: this.isPlayerInGame(userId),
      isPlayerTurn: this.isPlayerTurn(userId),
      yourPlayer: this.yourPlayer(userId),
      winner: this.winner
    };
  }

  isPlayerTurn(userId: string) {
    return (this.turn === Game.PLAYER_1 && userId === this.player1) ||
           (this.turn === Game.PLAYER_2 && userId === this.player2);
  }

  makeMove(row: number, col: number, userId: string) {
    if (!this.isPlayerInGame(userId)) {
      throw new Error('Game not found');
    }
    if (!this.isPlayerTurn(userId)) {
      throw new Error('Not your turn');
    }
    if (this.state[row][col] !== '') {
      throw new Error('Cell already occupied');
    }
    this.state[row][col] = this.turn;
    this.toggleTurn();
  }

  getValue(coordinates: Coordinates) {
    return this.state[coordinates.row][coordinates.col];
  }

  winnerForSeries(series: Coordinates[]) {
    if (series.every((coordinates: Coordinates) => this.getValue(coordinates) === Game.PLAYER_1)) {
      return Game.PLAYER_1;
    }
    if (series.every((coordinates: Coordinates) => this.getValue(coordinates) === Game.PLAYER_2)) {
      return Game.PLAYER_2;
    }
    return null;
  }

  getWinner() {
    let serieses: Coordinates[][] = [];
    for (let i = 0; i < 3; i++) {
      serieses.push([new Coordinates(i, 0), new Coordinates(i, 1), new Coordinates(i, 2)]);
      serieses.push([new Coordinates(0, i), new Coordinates(1, i), new Coordinates(2, i)]);
    }
    serieses.push([new Coordinates(0, 0), new Coordinates(1, 1), new Coordinates(2, 2)]);
    serieses.push([new Coordinates(0, 2), new Coordinates(1, 1), new Coordinates(2, 0)]);
    for (const series of serieses) {
      const winner = this.winnerForSeries(series);
      if (winner) {
        return winner;
      }
    }
    if (this.state.every((row: string[]) => row.every((cell: string) => cell !== ''))) {
      return 'draw';
    }
    return null;
  }
} 