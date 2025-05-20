
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

import { Game } from './game.js';

export function init() {
  // Placeholder: initialize application state here
  const game = Game.findGame();
  console.log('App initialized');
} 