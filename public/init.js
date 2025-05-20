
export function loadScriptIfNeeded(src) {
  // Check if script is already loaded
  if (document.querySelector(`script[src="${src}"]`)) {
    return;
  }
  // Create and append script
  const script = document.createElement('script');
  script.src = src;
  script.async = false;
  script.type = 'module';
  document.head.appendChild(script);
}

loadScriptIfNeeded('/game.js');
loadScriptIfNeeded('/gameboard.js');
import { Game } from './game.js';
import { gameBoard } from './gameboard.js';

export async function init() {
  const game = await Game.findGame();
  gameBoard.addCallback(async (row, column) => {
   await game.makeMove(row, column);
   gameBoard.render(game);
  });
  gameBoard.render(game);
  console.log('App initialized');
} 