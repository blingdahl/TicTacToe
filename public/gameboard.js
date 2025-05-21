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

    // Create table
    const table = document.createElement('table');

    // Floating player symbol indicator
    let indicator = document.getElementById('player-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'player-indicator';
      document.body.appendChild(indicator);
    }
    let playerSymbol = GameBoard.playerSymbol(game.yourPlayer);
    indicator.innerHTML = `You are ${playerSymbol}`;

    if (game.winner) {
      if (game.winner === 'draw') {
        indicator.textContent = 'Draw!';
      } else if (game.winner === game.yourPlayer) {
        indicator.textContent = `You win! You are ${playerSymbol}`;
      } else {
        indicator.textContent = `You lose! You are ${playerSymbol}`;
      }
      // Add new game link/button
      const newGameBtn = document.createElement('a');
      newGameBtn.href = window.location.pathname + '?userid=' + encodeURIComponent(game.yourPlayer === PLAYER_1 ? game.player1 : game.player2);
      newGameBtn.textContent = 'Start a new game';
      newGameBtn.className = 'new-game-link';
      newGameBtn.onclick = (e) => {
        e.preventDefault();
        // Remove gameid from URL and reload
        const url = new URL(window.location.href);
        url.searchParams.delete('gameid');
        window.location.href = url.toString();
      };
      indicator.appendChild(document.createElement('br'));
      indicator.appendChild(newGameBtn);
    } else if (!game.isPlayerTurn) {
      indicator.textContent += ' (waiting for opponent)';
    }
    
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
    board.appendChild(table);
  }
}

export const gameBoard = GameBoard.getInstance(); 