
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

export function init() {
  // Placeholder: initialize application state here
  const game = Game.findGame();
  gameBoard.render(game);
  console.log('App initialized');
} 