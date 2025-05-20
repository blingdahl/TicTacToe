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

  render(game) {
    if (!this.callback) {
      throw new Error('Callback not set');
    }

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

    for (let i = 0; i < 3; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < 3; j++) {
        const td = document.createElement('td');
        let cellValue = game.state[i][j];
        if (cellValue === 'X') cellValue = '×';
        if (cellValue === 'O') cellValue = '○';
        td.textContent = '' + cellValue;
        td.style.cursor = 'pointer';
        td.onclick = () => this.callback(i, j);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    board.appendChild(table);
  }
}

export const gameBoard = GameBoard.getInstance(); 