import { THEME, FONT_SHADOW } from '../ui/theme.js';
import ScoreDisplay from './ScoreDisplay.js';
import TimerDisplay from './TimerDisplay.js';

export default class HUDContainer {
  constructor(scene) {
    this.scene = scene;
    const { width } = scene.scale;
    const hudWidth = width - 220;
    const hudHeight = 120;
    const centerY = 60;
    this.width = hudWidth;
    this.height = hudHeight;
    this.centerY = centerY;

    this.container = scene.add.container(width / 2, centerY).setDepth(THEME.depths.hud);

    const background = scene.add.graphics();
    background.fillStyle(THEME.colors.hudOverlay, THEME.colors.hudOverlayAlpha);
    background.fillRoundedRect(-hudWidth / 2, -hudHeight / 2, hudWidth, hudHeight, 6);
    background.lineStyle(1, THEME.colors.hudStroke, 0.35);
    background.strokeRoundedRect(-hudWidth / 2, -hudHeight / 2, hudWidth, hudHeight, 6);
    this.container.add(background);

    this.scoreDisplay = new ScoreDisplay(scene, 0, -12, { originX: 0.5, originY: 0.5 });
    this.scoreDisplay.label.setPosition(0, -12);
    this.container.add(this.scoreDisplay.label);

    this.timerDisplay = new TimerDisplay(scene, 0, 12, { originX: 0.5, originY: 0.5 });
    this.timerDisplay.label.setPosition(0, 12);
    this.timerDisplay.label.setVisible(false); // Hidden until gameplay starts (v6 requirement)
    this.container.add(this.timerDisplay.label);
  }

  destroy() {
    this.scoreDisplay.destroy();
    this.timerDisplay.destroy();
    this.container.destroy();
  }
}
