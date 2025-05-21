
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
import { setGameID, getGameID } from './user.js';
export async function init() {
  const gameID = getGameID();
  let game;
  if (gameID) {
    game = await Game.load(gameID);
  } else {
    game = await Game.findGame();
    setGameID(game.gameId);
  }
  gameBoard.addCallback(async (row, column) => {
   await game.makeMove(row, column);
   window.location.reload();
  });
  if (!game.isPlayerTurn) {
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }
  gameBoard.render(game);
  console.log('App initialized');
} 