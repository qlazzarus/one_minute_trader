import Phaser from 'phaser';

import { THEME, FONT_SHADOW } from '../ui/theme.js';
import { setMode, GameModes } from '../state/GameModeManager.js';

export default class FarmScene extends Phaser.Scene {
  constructor() {
    super('FarmScene');
  }

  create() {
    const { width, height } = this.scale;
    console.log('[Phase 1.3] FarmScene stub mounted.');
    setMode(GameModes.FARM);

    this.add.rectangle(width / 2, height / 2, width, height, THEME.colors.background, 0.92);

    this.add
      .text(width / 2, height / 2 - 20, 'Farm mode is under construction.', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: '20px',
        color: THEME.colors.textPrimary,
        align: 'center'
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    // [Phase 1.3] Temporary exit so players can return to the main hub.
    this.add
      .text(width / 2, height / 2 + 40, 'Tap to return to menu', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: '18px',
        color: THEME.colors.textSecondary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.input.once('pointerdown', () => {
      console.log('[Phase 1.3] Returning to MainMenuScene from FarmScene.');
      this.scene.start('MainMenuScene');
    });
  }
}
