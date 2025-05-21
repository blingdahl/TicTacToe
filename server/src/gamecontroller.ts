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

class MissingIDError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingIDError';
  }
}

class GameNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameNotFoundError';
  }

  static forId(gameId: string): GameNotFoundError {
    return new GameNotFoundError('Game not found for id: ' + gameId);
  }
}

export class GameController { 
  constructor(private gameDb: GameDb) {
    this.gameDb = gameDb;
  }

  async findGame(userId: string): Promise<Game> {
    const activeGameRowsForUser = await this.gameDb.findActiveGamesForUser(userId);
    if (activeGameRowsForUser.length > 0) {
      return Game.fromRow(activeGameRowsForUser[0]);
    }

    const availableGameRows = await this.gameDb.findAvailableGameToJoin(userId);
    if (availableGameRows.length > 0) {
      await this.gameDb.joinGame(userId, availableGameRows[0].id);
      const gameRow = await this.gameDb.getGameRow(availableGameRows[0].id);
      return Game.fromRow(gameRow);
    } else {
      const insertId = await this.gameDb.createGame(userId, Game.serializeGameState(Game.DEFAULT_GAME_STATE), Game.PLAYER_1);
      const gameRow = await this.gameDb.getGameRow(insertId);
      return Game.fromRow(gameRow);
    }
  }

  async getGame(userId: string, gameId: string): Promise<Game> {
    if (!userId || !gameId) {
      throw new MissingIDError('Missing userid or gameId');
    }
    let gameRow = await this.gameDb.getGameRow(String(gameId));
    if (!gameRow) {
      throw GameNotFoundError.forId(gameId);
    }
    if (gameRow.player1 !== userId && gameRow.player2 === null) {
      this.gameDb.joinGame(userId, String(gameId));
      gameRow = await this.gameDb.getGameRow(String(gameId));
      gameRow.player2 = userId;
    }
    return Game.fromRow(gameRow);
  }

  async makeMove(userId: string, gameId: string, row: number, column: number): Promise<Game> {
    let gameRow = await this.gameDb.getGameRow(String(gameId));
    let game = Game.fromRow(gameRow);
    if (!game.isPlayerInGame(userId)) {
      throw GameNotFoundError.forId(gameId);
    }
    if (!game.isPlayerTurn(userId)) {
      throw new Error('Not your turn');
    }
    if (game.state[row][column] !== '') {
      throw new Error('Cell already occupied');
    }
    game.state[row][column] = game.turn;
    game.turn = game.turn === Game.PLAYER_1 ? Game.PLAYER_2 : Game.PLAYER_1;
    await this.gameDb.updateGameState(gameId, Game.serializeGameState(game.state), game.turn);
    let winner = game.getWinner();
    if (winner) {
      await this.gameDb.setGameWinner(gameId, winner);
    }
    gameRow = await this.gameDb.getGameRow(gameId);
    return Game.fromRow(gameRow);
  }
}
