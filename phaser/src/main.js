import Phaser from 'phaser';

import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import GameScene from './scenes/GameScene.js';
import ResultScene from './scenes/ResultScene.js';

const GAME_WIDTH = 480;
const GAME_HEIGHT = 800;

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  backgroundColor: '#111827',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  scene: [BootScene, MenuScene, GameScene, ResultScene]
};

// Launch Phaser with the initial scene list.
// eslint-disable-next-line no-new
new Phaser.Game(config);
