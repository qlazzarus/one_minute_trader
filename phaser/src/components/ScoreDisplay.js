import { THEME } from '../ui/theme.js';

const comboMultiplier = (streak) => {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
};

export default class ScoreDisplay {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.score = 0;
    this.streak = 0;
    const { depth = THEME.depths.hud, originX = 0, originY = 0.5 } = options;
    const font = THEME.fonts.hud;
    const shadow = THEME.shadows.small;
    this.regularFamily = font.stackRegular;
    this.boldFamily = font.stackBold;

    this.label = scene.add
      .text(x, y, this.getLabelText(), {
        fontFamily: this.regularFamily,
        fontSize: `${font.size}px`,
        fontStyle: 'normal',
        color: THEME.colors.textPrimary,
        stroke: '#000000',
        strokeThickness: 2,
        align: 'center'
      })
      .setOrigin(originX, originY)
      .setDepth(depth)
      .setShadow(
        shadow.offsetX,
        shadow.offsetY,
        `rgba(0,0,0,${shadow.alpha})`,
        0,
        true,
        true
      ); // 1px drop shadow for HUD readability.
  }

  setScore(score) {
    this.score = score;
    this.refresh();
  }

  setStreak(streak) {
    this.streak = streak;
    this.refresh();
  }

  refresh() {
    const isCombo = this.streak > 1;
    this.label.setText(this.getLabelText());
    this.label.setStyle({
      fontFamily: isCombo ? this.boldFamily : this.regularFamily,
      fontStyle: isCombo ? 'bold' : 'normal'
    });
  }

  destroy() {
    this.label.destroy();
  }

  getLabelText() {
    const lines = [`Score ${this.score}`];
    if (this.streak > 1) {
      const multiplier = comboMultiplier(this.streak);
      const multiplierText = multiplier > 1 ? ` (${multiplier.toFixed(1)}x)` : '';
      lines.push(`Combo ${this.streak}${multiplierText}`);
    }
    return lines.join('\n');
  }
}
