import { loadScriptIfNeeded } from './init.js';

loadScriptIfNeeded('/async.js');
loadScriptIfNeeded('/user.js');
loadScriptIfNeeded('/uuid.js');
import { fetchJSON } from './async.js';
import { getOrCreateUserID } from './user.js';
import { generateUUID } from './uuid.js';

const userId = getOrCreateUserID();

const gameScenario =  [
      ['X', 'O', 'X'],
      ['', 'X', 'O'],
      ['X', 'O', 'X']
    ]
const useGameScenario = true;
export class Game {
  constructor(gameId, state) {
    this.gameId = gameId;
    this.state = state;
  }

  static async findGame() {
    if (useGameScenario) {
      return new Game(generateUUID(), gameScenario);
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

