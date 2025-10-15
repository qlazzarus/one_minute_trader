import Phaser from 'phaser';
import { THEME, FONT_SHADOW } from '../ui/theme.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add
      .text(width / 2, height / 2, 'One Minute Trader', {
        fontFamily: THEME.fonts.hud.stackBold,
        fontSize: `${THEME.fonts.hud.size + 12}px`,
        color: THEME.colors.textPrimary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.add
      .text(width / 2, height / 2 + 80, 'Tap to start', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: `${THEME.fonts.hud.size - 2}px`,
        color: THEME.colors.textSecondary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
