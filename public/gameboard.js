class GameBoard {
  static instance = null;

  static getInstance() {
    if (!GameBoard.instance) {
      GameBoard.instance = new GameBoard();
    }
    return GameBoard.instance;
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
    table.style.width = '100vw';
    table.style.height = '100vh';
    table.style.borderCollapse = 'collapse';
    table.style.tableLayout = 'fixed';

    for (let i = 0; i < 3; i++) {
      const tr = document.createElement('tr');
      for (let j = 0; j < 3; j++) {
        const td = document.createElement('td');
        td.style.border = '2px solid #333';
        td.style.width = '33vw';
        td.style.height = '33vh';
        td.style.textAlign = 'center';
        td.style.verticalAlign = 'middle';
        td.style.overflow = 'hidden';
        td.style.fontSize = 'calc(min(33vw, 33vh) * 0.7)';
        console.log(game.state);
        td.textContent = '' + game.state[i][j];
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
    board.appendChild(table);
  }
}

export const gameBoard = GameBoard.getInstance(); 