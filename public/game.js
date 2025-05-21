import { loadScriptIfNeeded } from './init.js';

loadScriptIfNeeded('/async.js');
loadScriptIfNeeded('/user.js');
loadScriptIfNeeded('/uuid.js');
import { fetchJSON } from './async.js';
import { getOrCreateUserID } from './user.js';
import { generateUUID } from './uuid.js';

export const PLAYER_1 = 'player1';
export const PLAYER_2 = 'player2';

const userId = getOrCreateUserID();

const gameScenario =  [
      [PLAYER_1, PLAYER_2, PLAYER_1],
      ['', PLAYER_1, PLAYER_2],
      [PLAYER_2, PLAYER_1, PLAYER_2]
    ]
const useGameScenario = false;

export class Game {
  constructor(gameId, state, yourPlayer, isPlayerTurn, winner) {
    this.gameId = gameId;
    this.state = state;
    this.yourPlayer = yourPlayer;
    this.isPlayerTurn = isPlayerTurn;
    this.winner = winner;
  }

  static fromJSON(jsonGame) {
    return new Game(jsonGame.gameId, jsonGame.state, jsonGame.yourPlayer, jsonGame.isPlayerTurn, jsonGame.winner);
  }

  static async load(gameId) {
    let {game} = await fetchJSON('/api/game/get', { userId: userId, gameId: gameId });
    return Game.fromJSON(game);
  }

  static async findGame() {
    if (useGameScenario) {
      return new Game(1, gameScenario);
    }
    try {
      const data = await fetchJSON('/api/game/find', { userId: userId });
      let game = data.game;
      if (!game) {
        throw new Error('No games found');
      }
      return Game.fromJSON(game);
    } catch (error) {
      throw new Error('Error finding game: ' + error.message);
    }
  }

  async makeMove(row, column) {
    if (this.state[row][column] !== '') {
      return;
    }
    let {game} = await fetchJSON('/api/game/move', { userId: userId, gameId: this.gameId, row: row, column: column });
    this.state = game.state;
  }

  asymc 
}

