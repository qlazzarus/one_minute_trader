import { THEME, FONT_SHADOW } from '../ui/theme.js';

const COIN_CONFIGS = [
  { key: 'BTC', color: 0xfacc15 },
  { key: 'ETH', color: 0x60a5fa },
  { key: 'SOL', color: 0xa855f7 }
];

export default class CoinSelector {
  constructor(scene, anchorY, onSelect) {
    this.scene = scene;
    this.onSelect = onSelect;

    const { width, height } = scene.scale;
    const spacing = height * 0.08;
    const startY = anchorY;
    const titleY = anchorY - 60; // Place title just above first button per v7 rules

    this.container = scene.add.container(0, 0).setDepth(THEME.depths.hud);

    const title = scene.add
      .text(width / 2, titleY, 'Select Coin', {
        fontFamily: THEME.fonts.hud.stackBold,
        fontSize: `${THEME.fonts.hud.size}px`,
        color: THEME.colors.textPrimary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.container.add(title);

    this.buttons = COIN_CONFIGS.map((coin, index) => {
      const button = this.createButton(coin, width / 2, startY + index * spacing);
      this.container.add(button);
      return button;
    });
  }

  createButton(coin, x, y) {
    const button = this.scene.add.container(x, y);
    const background = this.scene.add
      .rectangle(0, 0, 240, 60, coin.color, 0.25)
      .setStrokeStyle(2, coin.color);

    const label = this.scene.add
      .text(0, 0, coin.key, {
        fontFamily: THEME.fonts.button.stack,
        fontSize: `${THEME.fonts.button.size}px`,
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    button.add([background, label]);
    background.setInteractive({ useHandCursor: true });
    background.on('pointerover', () => background.setAlpha(0.4));
    background.on('pointerout', () => background.setAlpha(0.25));
    background.on('pointerdown', () => {
      this.handleSelect(coin);
    });

    return button;
  }

  handleSelect(coin) {
    this.hide();
    this.onSelect(coin);
  }

  hide() {
    this.container.setVisible(false);
    this.container.setActive(false);
  }

  show() {
    this.container.setVisible(true);
    this.container.setActive(true);
  }
}
