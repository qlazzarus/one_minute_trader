import Phaser from 'phaser';

import BootScene from './scenes/BootScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import MainMenuScene from './scenes/MainMenuScene.js';
import MiningScene from './scenes/MiningScene.js';
import GameScene from './scenes/GameScene.js';
import FarmScene from './scenes/FarmScene.js';
import ResultScene from './scenes/ResultScene.js';
import SettingsScene from './scenes/SettingsScene.js';

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
  scene: [
    BootScene,
    LoadingScene,
    MainMenuScene,
    MiningScene,
    GameScene,
    FarmScene,
    ResultScene,
    SettingsScene
  ]
};

// Launch Phaser with the initial scene list.
// eslint-disable-next-line no-new
new Phaser.Game(config);
