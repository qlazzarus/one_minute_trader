import Phaser from 'phaser';

import { THEME, FONT_SHADOW } from '../ui/theme.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super('SettingsScene');
  }

  create() {
    const { width, height } = this.scale;
    console.log('[Phase 1.3 UI] SettingsScene opened.');

    this.add.rectangle(width / 2, height / 2, width, height, THEME.colors.background, 0.9);

    this.add
      .text(width / 2, height / 2 - 60, 'Settings', {
        fontFamily: THEME.fonts.hud.stackBold,
        fontSize: '28px',
        color: THEME.colors.textPrimary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.add
      .text(width / 2, height / 2, '음량 설정 / 언어 / 리셋', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: '20px',
        color: THEME.colors.textSecondary,
        align: 'center'
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.add
      .text(width / 2, height / 2 + 120, 'Tap anywhere to return', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: '18px',
        color: THEME.colors.textSecondary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.input.once('pointerdown', () => {
      console.log('[Phase 1.3 UI] Closing SettingsScene.');
      this.scene.start('MainMenuScene');
    });
  }
}
