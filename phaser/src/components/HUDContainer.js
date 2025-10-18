import { THEME, FONT_SHADOW } from '../ui/theme.js';
import ScoreDisplay from './ScoreDisplay.js';
import TimerDisplay from './TimerDisplay.js';

const COMBO_LAYER_DEPTH = 10;
const TIMER_CRITICAL_SECONDS = 2;

export default class HUDContainer {
  constructor(scene) {
    this.scene = scene;
    const { width, height } = scene.scale;
    const hudWidth = width - 220;
    const hudHeight = 120;
    const centerY = 60;
    this.width = hudWidth;
    this.height = hudHeight;
    this.centerY = centerY;
    this.comboTween = null;
    this.timerBlinkTween = null;

    const roundGroupY = height * 0.1;
    const scoreGroupY = roundGroupY - 28;

    // Score block anchored to top-center to prevent overlap with lower HUD elements.
    this.scoreGroup = scene.add.container(width / 2, scoreGroupY).setDepth(THEME.depths.hud);
    this.container = this.scoreGroup; // Backwards compatibility for callers using container ref.

    this.scoreDisplay = new ScoreDisplay(scene, 0, 0, { originX: 0.5, originY: 0.5 });
    this.scoreDisplay.label.setStyle({
      fontFamily: THEME.fonts.hud.stackBold,
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    this.scoreGroup.add(this.scoreDisplay.label);

    this.roundGroup = scene.add.container(width / 2, roundGroupY).setDepth(THEME.depths.hud);

    // Round status sits slightly higher (height*0.1) so the entire HUD stack floats near the top edge.
    this.roundLabel = scene.add
      .text(0, 0, 'Round 1 / 12', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: '18px',
        fontStyle: 'normal',
        color: '#33ccff',
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0.8)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);
    this.roundGroup.add(this.roundLabel);

    // Timer inherits neon cyan to reinforce urgency while stacked under the round label.
    // Timer remains centered under the round label with 26px offset to guarantee a 20px+ gap between captions.
    this.timerDisplay = new TimerDisplay(scene, 0, 26, 0, {
      originX: 0.5,
      originY: 0.5,
      color: '#00e5ff'
    });
    this.timerDisplay.label.setStyle({
      fontFamily: THEME.fonts.hud.stackBold,
      fontSize: '22px',
      fontStyle: 'normal',
      color: '#00e5ff'
    });
    this.timerDisplay.label.setVisible(false); // Hidden until gameplay starts (v6 requirement)
    this.roundGroup.add(this.timerDisplay.label);

    this.scoreDisplay.refresh = () => {
      this.scoreDisplay.label.setText(`Score ${this.scoreDisplay.score ?? 0}`);
    };
    this.scoreDisplay.refresh();

    const originalTimerReset = this.timerDisplay.reset.bind(this.timerDisplay);
    this.timerDisplay.reset = (seconds) => {
      originalTimerReset(seconds);
      this.stopTimerBlink();
      this.timerDisplay.label.setAlpha(1);
    };

    const originalTimerSetRemaining = this.timerDisplay.setRemaining.bind(this.timerDisplay);
    this.timerDisplay.setRemaining = (seconds) => {
      originalTimerSetRemaining(seconds);
      this.handleTimerBlink(seconds);
    };

    const originalSetVisible = this.timerDisplay.label.setVisible.bind(this.timerDisplay.label);
    this.timerDisplay.label.setVisible = (value) => {
      if (!value) {
        this.stopTimerBlink();
        this.timerDisplay.label.setAlpha(1);
      }
      return originalSetVisible(value);
    };

    // ComboLayer sits outside the HUD card so combo pops float above every HUD element.
    // ComboLayer starts near the screen midpoint; GameScene realigns it to chart bottom via setComboAnchor().
    this.comboLayer = scene.add
      .container(width / 2, height * 0.55)
      .setDepth(COMBO_LAYER_DEPTH)
      .setVisible(false)
      .setAlpha(0);

    this.comboText = scene.add
      .text(0, 0, '', {
        fontFamily: THEME.fonts.hud.stackBold,
        fontSize: '28px',
        fontStyle: 'bold',
        color: '#ffd966',
        align: 'center'
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);
    this.comboLayer.add(this.comboText);
  }

  destroy() {
    this.scoreDisplay.destroy();
    this.roundLabel.destroy();
    this.timerDisplay.destroy();
    this.stopTimerBlink();
    if (this.comboTween) {
      this.comboTween.stop();
      this.comboTween = null;
    }
    this.scoreGroup.destroy();
    this.roundGroup.destroy();
    this.comboText.destroy();
    this.comboLayer.destroy();
  }

  setRound(current, total) {
    if (this.roundLabel) {
      this.roundLabel.setText(`Round ${current} / ${total}`);
    }
  }

  setComboAnchor(x, y) {
    if (!this.comboLayer) return;
    // GameScene provides chartOrigin + (chartHeight / 2) + 40 to align pops beneath the graph.
    this.comboLayer.setPosition(x, y);
  }

  showCombo(comboLevel) {
    if (!this.comboLayer || !this.comboText) return;

    const displayText = `Combo x${comboLevel.toFixed(1)}!`;
    this.comboText.setText(displayText);
    if (typeof this.comboText.setGradient === 'function') {
      this.comboText.setGradient('#ffd966', '#ffd966', '#ff8800', '#ff8800');
    } else {
      this.comboText.setColor('#ffd966');
    }
    this.comboText.setAlpha(1);

    if (this.comboTween) {
      this.comboTween.stop();
      this.comboTween = null;
    }

    this.comboLayer.setVisible(true);
    this.comboLayer.setAlpha(1);
    this.comboLayer.setScale(1.5);

    this.comboTween = this.scene.tweens.add({
      targets: this.comboLayer,
      // ComboLayer animates scale/alpha so the pop floats at chart bottom before fading out.
      scale: 1,
      alpha: 0,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.comboLayer.setVisible(false);
      }
    });
  }

  handleTimerBlink(seconds) {
    if (!this.timerDisplay?.label) return;
    if (seconds > TIMER_CRITICAL_SECONDS || seconds <= 0) {
      this.stopTimerBlink();
      if (seconds <= 0) {
        this.timerDisplay.label.setAlpha(1);
      }
      return;
    }

    if (this.timerBlinkTween) return;
    this.timerBlinkTween = this.scene.tweens.add({
      targets: this.timerDisplay.label,
      alpha: { from: 1, to: 0.2 },
      duration: 200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  stopTimerBlink() {
    if (this.timerBlinkTween) {
      this.timerBlinkTween.stop();
      this.timerBlinkTween = null;
    }
    if (this.timerDisplay?.label) {
      this.timerDisplay.label.setAlpha(1);
    }
  }
}
