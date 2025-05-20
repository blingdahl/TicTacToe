import { loadScriptIfNeeded } from './init.js';

loadScriptIfNeeded('/async.js');
loadScriptIfNeeded('/user.js');

import { fetchJSON } from './async.js';
import { getOrCreateUserID } from './user.js';

const userId = getOrCreateUserID();

export class Game {
  constructor() {
    // Initialize empty 3x3 grid
    this.state = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.gameId = null;
  }

  static async findGame() {
    try {
      const data = await fetchJSON('/api/game/find', { userId: userId });
      if (data.gameId) {
        this.gameId = data.gameId;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error finding game:', error);
      return false;
    }
  }
}

