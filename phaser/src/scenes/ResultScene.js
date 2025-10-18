import Phaser from 'phaser';
import { THEME, FONT_SHADOW } from '../ui/theme.js';

export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(data) {
    const { width, height } = this.scale;
    const { score = 0, selectedCoin = 'N/A', rounds = 0 } = data ?? {};

    this.add
      .text(width / 2, height / 2 - 40, 'Session Complete', {
        fontFamily: THEME.fonts.hud.stackBold,
        fontSize: `${THEME.fonts.hud.size + 4}px`,
        color: THEME.colors.success
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.add
      .text(
        width / 2,
        height / 2 + 10,
        `Coin: ${selectedCoin}\nRounds: ${rounds}\nScore: ${score}`,
        {
          fontFamily: THEME.fonts.hud.stackRegular,
          fontSize: `${THEME.fonts.hud.size - 2}px`,
          color: THEME.colors.textPrimary,
          align: 'center'
        }
      )
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.add
      .text(width / 2, height / 2 + 120, 'Tap to return to menu', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: `${THEME.fonts.hud.size - 6}px`,
        color: THEME.colors.textSecondary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.input.once('pointerdown', () => {
      console.log('[Phase 1.3] Returning to MainMenuScene from ResultScene.');
      this.scene.start('MainMenuScene');
    });
  }
}
