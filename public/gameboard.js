import { PLAYER_1, PLAYER_2 } from './game.js';

class GameBoard {
  static instance = null;

  static getInstance() {
    if (!GameBoard.instance) {
      GameBoard.instance = new GameBoard();
    }
    return GameBoard.instance;
  }

  addCallback(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    this.callback = callback;
  }

  static playerSymbol(player) {
    return player === PLAYER_1 ? '×' : '○';
  }

  makeNewGameButton(game) {
    const newGameBtn = document.createElement('a');
    newGameBtn.href = window.location.pathname + '?userid=' + encodeURIComponent(game.yourPlayer === PLAYER_1 ? game.player1 : game.player2);
    newGameBtn.textContent = 'Start a new game';
    newGameBtn.className = 'new-game-button';
    newGameBtn.onclick = (e) => {
      e.preventDefault();
      // Remove gameid from URL and reload
      const url = new URL(window.location.href);
      url.searchParams.delete('gameid');
      window.location.href = url.toString();
    };
    return newGameBtn;
  }

  makeSwitchPlayerButton(game) {
    const switchPlayerBtn = document.createElement('button');
    switchPlayerBtn.textContent = 'Switch player';
    switchPlayerBtn.className = 'switch-player-button';
    switchPlayerBtn.onclick = (e) => {
      e.preventDefault();
      const url = new URL(window.location.href);
      if (game.player2 === null) {
        url.searchParams.delete('userid');
      } else {
        url.searchParams.set('userid', encodeURIComponent(game.yourPlayer === PLAYER_1 ? game.player2 : game.player1));
      }
      window.location.href = url.toString();
    };
    return switchPlayerBtn;
  }

  makeIndicator(game) {
    let indicator = document.getElementById('player-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'player-indicator';
      document.body.appendChild(indicator);
    }
    let playerSymbol = GameBoard.playerSymbol(game.yourPlayer);
    if (game.winner) {  
      if (game.winner === 'draw') {
        indicator.textContent = 'Draw!';
      } else if (game.winner === game.yourPlayer) {
        indicator.textContent = `You win! You are ${playerSymbol}`;
      } else {
        indicator.textContent = `You lose! You are ${playerSymbol}`;
      }
    } else if (!game.isPlayerTurn) {
      indicator.textContent += `You are ${playerSymbol} (waiting for opponent)`;
    } else {
      indicator.innerHTML = `You are ${playerSymbol}`;
    }
  }
  
  makeGameTable(game) {
    const table = document.createElement('table');
    for (let i = 0; i < 3; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < 3; j++) {
        const td = document.createElement('td');
        let cellValue = game.state[i][j];
        if (cellValue !== '') {
          cellValue = GameBoard.playerSymbol(cellValue);
        }
        td.textContent = '' + cellValue;
        if (game.isPlayerTurn && !game.winner) {
          td.style.cursor = 'pointer';
          td.onclick = () => this.callback(i, j);
        }
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    return table;
  }
  
  render(game) {
    let root = document.getElementById('root');
    let board = document.getElementById('board');
    if (!board) {
      board = document.createElement('div');
      board.id = 'board';
      root.appendChild(board);
    }
    // Clear previous content
    board.innerHTML = '';
    if (!game.isPlayerTurn) {
      let switchPlayerBtn = this.makeSwitchPlayerButton(game);
      board.appendChild(switchPlayerBtn);
    }
    if (game.winner) {
      let newGameBtn = this.makeNewGameButton(game);
      board.appendChild(newGameBtn);
    }

    // Create table
    const table = document.createElement('table');

    // Floating player symbol indicator
    this.makeIndicator(game);
    let gameTable = this.makeGameTable(game);
    board.appendChild(gameTable);
  }
}

export const gameBoard = GameBoard.getInstance(); 