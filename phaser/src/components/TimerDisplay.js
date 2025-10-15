import { THEME } from '../ui/theme.js';

export default class TimerDisplay {
  constructor(scene, x, y, totalSeconds, options = {}) {
    this.scene = scene;
    this.totalSeconds = totalSeconds;
    this.remainingSeconds = totalSeconds;
    const { depth = THEME.depths.hud, originX = 0.5, originY = 0.5, color } = options;
    const font = THEME.fonts.hud;
    const shadow = THEME.shadows.small;

    this.label = scene.add
      .text(x, y, this.formatTime(this.remainingSeconds), {
        fontFamily: font.stackRegular,
        fontSize: `${font.size - 2}px`,
        fontStyle: 'normal',
        color: color ?? THEME.colors.textSecondary,
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
      );
  }

  reset(seconds) {
    this.totalSeconds = seconds;
    this.remainingSeconds = seconds;
    this.refresh();
  }

  setRemaining(seconds) {
    this.remainingSeconds = Math.max(0, seconds);
    this.refresh();
  }

  refresh() {
    this.label.setText(this.formatTime(this.remainingSeconds));
  }

  destroy() {
    this.label.destroy();
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
