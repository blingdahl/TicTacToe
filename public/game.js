import { loadScriptIfNeeded } from './init.js';

loadScriptIfNeeded('/async.js');
loadScriptIfNeeded('/user.js');

import { fetchJSON } from './async.js';
import { getOrCreateUserID } from './user.js';

const userId = getOrCreateUserID();

const gameScenario =  [
      ['X', 'O', 'X'],
      ['', 'X', 'O'],
      ['X', 'O', 'X']
    ]
const useGameScenario = false;
export class Game {
  constructor(gameId, state) {
    this.gameId = gameId;
    this.state = state;
  }

  render() {
    const board = document.getElementById('board');
    if (!board) {
      document.body.getElementById('root').appendChild(document.createElement('div'));
      board = document.body.getElementById('root').lastElementChild;
    }
    board.innerHTML = this.state.map(row => row.join(' ')).join('\n');
  }

  static async findGame() {
    if (useGameScenario) {
      return new Game(gameScenario);
    }
    try {
      const data = await fetchJSON('/api/game/find', { userId: userId });
      if (data.gameId) {
        return new Game(data.gameId, data.state);
      }
      throw new Error('No game found');
    } catch (error) {
      throw new Error('Error finding game: ' + error.message);
    }
  }
}

