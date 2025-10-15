import Phaser from 'phaser';

import CoinSelector from '../components/CoinSelector.js';
import BibiDisplay from '../components/BibiDisplay.js';
import HUDContainer from '../components/HUDContainer.js';
import { THEME, FONT_SHADOW } from '../ui/theme.js';

const ROUND_DURATION_MS = 5000;
const TOTAL_DURATION_MS = 60000;
const PRICE_UPDATE_INTERVAL_MS = 150;
const BASE_SCORE = 10;
const FAIL_PENALTY = 5;
const COMBO_GLOW_THRESHOLD = 3; // Glow kicks in when streak is 3 or more.
const GRAPH_ALPHA_TWEEN_DURATION = 450; // Fade/scale duration for round intro.
const MAX_LINE_THICKNESS = 3; // Upper bound for line width when volatility spikes.
const MIN_LINE_THICKNESS = 1.5; // Lower bound for calm movement.
const CHART_DEPTH_BACKGROUND = THEME.depths.chartCard;
const CHART_DEPTH_LINE = THEME.depths.chartLine;
const CHART_GLOW_ALPHA = 0.1; // Transparency for outer glow strokes.
const CHART_GLOW_WIDTH = 4; // Width for soft glow outline around the chart.

const calculateMultiplier = (streak) => {
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
};

// Linear interpolation helper for numeric ranges.
const lerp = (start, end, t) => start + (end - start) * Phaser.Math.Clamp(t, 0, 1);

// Blend between two 0xRRGGBB integers based on t (0-1).
const lerpColor = (from, to, t) => Phaser.Display.Color.Interpolate.ColorWithColor(
  Phaser.Display.Color.ValueToColor(from),
  Phaser.Display.Color.ValueToColor(to),
  100,
  Phaser.Math.Clamp(t, 0, 1) * 100
);

// Convert interpolation result back to Phaser-compatible integer.
const colorToNumber = (color) => Phaser.Display.Color.GetColor(color.r, color.g, color.b);

// Brightness/contrast helper to keep lines readable over dark backgrounds.
const brightenColor = (colorValue, factor = 1.15) => {
  const color = Phaser.Display.Color.ValueToColor(colorValue);
  const r = Phaser.Math.Clamp(color.r * factor, 0, 255);
  const g = Phaser.Math.Clamp(color.g * factor, 0, 255);
  const b = Phaser.Math.Clamp(color.b * factor, 0, 255);
  return Phaser.Display.Color.GetColor(r, g, b);
};

const BIBI_LINES = {
  intro: { text: '오늘도 한탕 노려볼까?', voice: 'voice_intro', expression: 'talk' },
  coinPrompt: { text: '어떤 코인 할래?', voice: 'voice_intro', expression: 'talk' },
  coinSelected: (coinKey) => ({
    text: `오늘은 ${coinKey} 간다~ 🚀`,
    voice: 'voice_coin_start',
    expression: 'happy',
    revertAfter: 1800
  }),
  roundStart: (round) => ({
    text: `라운드 ${round}! 느낌 오는 방향으로 눌러봐~`,
    voice: null,
    expression: 'talk'
  }),
  predictUp: { text: '올라간다, 올라가~!', voice: 'voice_up', expression: 'talk' },
  predictDown: { text: '하락장엔 쇼트지~', voice: 'voice_down', expression: 'talk' },
  locked: { text: '잠금 완료! 차트를 지켜보자~', voice: null, expression: 'idle' },
  success: { text: '좋았어! 이 감각 계속 이어가자!', voice: null, expression: 'happy', revertAfter: 2000 },
  combo: { text: '이건 그냥 예언자 수준인데?', voice: 'voice_combo', expression: 'happy', revertAfter: 2200 },
  fail: { text: '에이, 코인 다 팔걸...', voice: 'voice_fail', expression: 'sad', revertAfter: 2000 },
  noPrediction: { text: '다음엔 빨리 눌러줘!', voice: null, expression: 'sad', revertAfter: 1600 },
  sessionEnd: { text: '1분 끝! 수익률 계산 중~', voice: 'voice_timeout', expression: 'talk', revertAfter: 2200 }
};

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init() {
    this.score = 0;
    this.streak = 0;
    this.roundIndex = 0;
    this.timeRemainingMs = TOTAL_DURATION_MS;
    this.sessionActive = false;
    this.roundActive = false;
    this.selectedCoin = null;
    this.bgm = null;
    this.chartIntroTween = null; // Holds the current round intro tween so we can cancel between rounds.
    this.chartGlowFx = null; // Cache for the glow post-FX instance when combos are active.
    this.smoothedData = []; // Render buffer for tweened chart points.
    this.chartTween = null; // Active tween easing point movement.
    this.chartTweenProgress = 1; // Progress value for point interpolation.
    this.smoothStartValue = 0; // Starting Y value for the current tween.
    this.smoothEndValue = 0; // Ending Y value for the current tween.
    this.chartIntroTweens = []; // Collection of active intro tweens.
    this.chartCard = null;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, THEME.colors.background, 0.82);

    this.hud = new HUDContainer(this);
    this.scoreDisplay = this.hud.scoreDisplay;
    this.timerDisplay = this.hud.timerDisplay;

    const verticalSpacing = height * 0.03;
    const chartHeight = height * 0.4;
    const chartOriginY = this.hud.container.y + this.hud.height / 2 + verticalSpacing;
    this.chartWidth = width - 120;
    this.chartHeight = chartHeight;
    const chartOriginX = (width - this.chartWidth) / 2;

    //const bibiX = width - 120;
    const bibiX = width - 240;
    const bibiY = height - 40; // v6: place Bibi close to bottom edge without overlapping buttons
    this.bibiDisplay = new BibiDisplay(this, bibiX, bibiY); // Bibi anchored per layout v6 margins.
    console.log('Bibi loaded:', this.bibiDisplay?.sprite?.texture?.key); // Quick visibility check for sprite preload.
    this.sayBibi('coinPrompt');

    this.chartCard = this.add.graphics().setDepth(CHART_DEPTH_BACKGROUND);
    this.chartCard.setPosition(chartOriginX, chartOriginY);
    this.chartCard.setAlpha(0);
    this.chartCard.setScale(0.96);
    this.drawChartCard(); // Render rounded navy card behind the line chart.

    this.chartGraphics = this.add.graphics().setDepth(CHART_DEPTH_LINE); // Graphics layer used for custom chart strokes.
    this.chartGraphics.setPosition(chartOriginX, chartOriginY);
    this.chartGraphics.setAlpha(0); // Graphics hidden until tween completes.
    this.chartGraphics.setScale(0.96); // Match background scale for cohesive intro.

    const chartBottom = chartOriginY + this.chartHeight;

    this.createPredictionButtons();
    this.disablePredictionButtons();
    this.setPredictionButtonsVisible(false); // Hide buttons until gameplay starts (v7)

    const buttonY = this.predictionButtons.up.container.y;
    this.coinSelector = new CoinSelector(this, buttonY - 120, (coin) => {
      this.selectedCoin = coin;
      this.sayBibi('coinSelected', coin.key);
      this.coinSelector.hide();
      this.startGame();
    });

    this.priceData = [];
    this.currentPrice = 100;
    this.roundStartPrice = 100;
    this.chartStrokeColor = 0x60a5fa;
    this.updateChartGlow(); // Ensure glow is cleared before gameplay starts.

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopBgm();
      this.hud?.destroy();
    });
  }

  startGame() {
    if (this.sessionActive) return;

    this.sessionActive = true;
    this.resetState();

    this.chartStrokeColor = this.selectedCoin?.color ?? 0x60a5fa;
    this.enablePredictionButtons();
    this.setPredictionButtonsVisible(true); // Buttons appear only during active play

    this.playBgm();
    this.timerDisplay.label.setVisible(true); // Timer appears when gameplay begins

    this.priceUpdateEvent = this.time.addEvent({
      delay: PRICE_UPDATE_INTERVAL_MS,
      loop: true,
      callback: this.updatePrice,
      callbackScope: this
    });

    this.timerTickEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: this.handleTimerTick,
      callbackScope: this
    });

    this.startRound();
  }

  resetState() {
    this.score = 0;
    this.streak = 0;
    this.roundIndex = 0;
    this.timeRemainingMs = TOTAL_DURATION_MS;
    this.scoreDisplay.setScore(this.score);
    this.scoreDisplay.setStreak(this.streak);
    this.timerDisplay.reset(TOTAL_DURATION_MS / 1000);
    this.timerDisplay.label.setVisible(false); // Hide timer until a round starts
    this.setPredictionButtonsVisible(false); // Hide buttons in idle state
    this.priceData = [];
    this.currentPrice = 100;
    this.roundStartPrice = 100;
    this.smoothedData = [];
    this.sayBibi('roundStart', 1);
    this.updateChartGlow(); // Reset any combo glow when a new session begins.
  }

  handleTimerTick() {
    if (!this.sessionActive) return;

    this.timeRemainingMs = Math.max(0, this.timeRemainingMs - 1000);
    this.timerDisplay.setRemaining(Math.ceil(this.timeRemainingMs / 1000));

    if (this.timeRemainingMs <= 0) {
      if (this.roundActive) {
        this.resolveRound({ dueToTimeout: true });
      }
      this.endGame();
    }
  }

  startRound() {
    if (!this.sessionActive) return;
    if (this.timeRemainingMs <= 0) {
      this.endGame();
      return;
    }

    this.roundIndex += 1;
    this.roundActive = true;
    this.roundPrediction = null;
    this.roundStartPrice = this.currentPrice;
    this.roundStartTime = this.time.now;
    this.priceData = [this.currentPrice];
    this.smoothedData = [...this.priceData]; // Seed smoothed data with the starting price.
    this.drawChart();
    this.enablePredictionButtons();
    this.playChartIntroTween(); // Kick off fade/scale intro for the chart each round.
    this.updateChartGlow(); // Reapply glow effect in case streak carried over to the new round.

    this.sayBibi('roundStart', this.roundIndex);

    if (this.roundEvent) {
      this.roundEvent.remove(false);
    }

    this.roundEvent = this.time.delayedCall(
      ROUND_DURATION_MS,
      () => {
        this.resolveRound({ dueToTimeout: false });
      },
      null,
      this
    );
  }

  createPredictionButtons() {
    const { width } = this.scale;
    const sprite = this.bibiDisplay.sprite;
    const spriteCenterX = sprite.x + sprite.displayWidth / 2; // Center aligned with Bibi per layout v5
    const buttonWidth = 220;
    const buttonOffset = (buttonWidth + 32) / 2; // Maintain 32px edge gap between buttons
    const buttonY = sprite.y - sprite.displayHeight - 60; // 60px above Bibi top per layout v6

    const margin = 120;
    let leftX = spriteCenterX - buttonOffset;
    let rightX = spriteCenterX + buttonOffset;
    if (rightX > width - margin) {
      const shift = rightX - (width - margin);
      leftX -= shift;
      rightX -= shift;
    } else if (leftX < margin) {
      const shift = margin - leftX;
      leftX += shift;
      rightX += shift;
    }

    this.predictionButtons = {
      up: this.createPredictionButton(leftX, buttonY, 'UP 🚀', 0x22c55e, () =>
        this.handlePrediction('up')
      ),
      down: this.createPredictionButton(rightX, buttonY, 'DOWN 💥', 0xef4444, () =>
        this.handlePrediction('down')
      )
    };
  }

  setPredictionButtonsVisible(visible) {
    Object.values(this.predictionButtons ?? {}).forEach((button) => {
      button.container.setVisible(visible);
      button.background.setVisible(visible);
      button.text.setVisible(visible);
    });
  }

  createPredictionButton(x, y, label, color, handler) {
    const container = this.add.container(x, y).setDepth(THEME.depths.hud);

    const background = this.add.rectangle(0, 0, 220, 63, color, 0.25).setStrokeStyle(2, color); // Height reduced ~10% per v6
    const buttonFont = THEME.fonts.button;
    const text = this.add
      .text(0, 0, label, {
        fontFamily: buttonFont.stack,
        fontSize: `${buttonFont.size}px`,
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    background.setInteractive({ useHandCursor: true });
    background.on('pointerover', () => {
      if (background.input && background.input.enabled) {
        background.setAlpha(0.35);
      }
    });
    background.on('pointerout', () => {
      background.setAlpha(0.25);
    });
    background.on('pointerdown', () => {
      this.sound.play('sfx_button', { volume: 0.4 });
      handler();
    });

    container.add([background, text]);

    return { container, background, text, color };
  }

  handlePrediction(direction) {
    if (!this.roundActive || this.roundPrediction) return;

    this.roundPrediction = direction;
    this.disablePredictionButtons();

    if (direction === 'up') {
      this.sayBibi('predictUp');
    } else {
      this.sayBibi('predictDown');
    }

    this.time.delayedCall(400, () => {
      this.sayBibi('locked');
    });
  }

  enablePredictionButtons() {
    Object.values(this.predictionButtons).forEach((button) => {
      button.background.setInteractive({ useHandCursor: true });
      button.background.setAlpha(0.25);
    });
  }

  disablePredictionButtons() {
    Object.values(this.predictionButtons).forEach((button) => {
      button.background.disableInteractive();
      button.background.setAlpha(0.1);
    });
  }

  updatePrice() {
    if (!this.sessionActive) return;

    const volatility = Phaser.Math.FloatBetween(-1.8, 1.8);
    const trendBias = this.streak >= 3 ? Phaser.Math.FloatBetween(-0.6, 0.3) : 0;
    const drift = Phaser.Math.FloatBetween(-0.4, 0.4);
    const change = volatility + trendBias + drift;

    this.currentPrice = Phaser.Math.Clamp(this.currentPrice + change, 90, 110);
    this.priceData.push(this.currentPrice);

    if (!this.smoothedData.length) {
      this.smoothedData = [...this.priceData]; // Initialise smoothed buffer on first update.
    }

    const lastSmoothed = this.smoothedData[this.smoothedData.length - 1] ?? this.currentPrice;
    if (this.smoothedData.length < this.priceData.length) {
      this.smoothedData.push(lastSmoothed); // Append placeholder so tween can drive the final point.
    } else {
      this.smoothedData[this.smoothedData.length - 1] = lastSmoothed;
    }

    if (this.priceData.length > 80) {
      this.priceData.shift();
      this.smoothedData.shift(); // Keep smoothed buffer aligned with trimmed raw data.
    }

    this.smoothStartValue = lastSmoothed;
    this.smoothEndValue = this.currentPrice;
    this.chartTweenProgress = 0;

    if (this.chartTween) {
      this.chartTween.stop(); // Cancel previous interpolation if still running.
      this.chartTween = null;
    }

    this.chartTween = this.tweens.add({
      targets: this,
      chartTweenProgress: 1,
      duration: Math.max(PRICE_UPDATE_INTERVAL_MS, 180),
      ease: 'Sine.easeOut',
      onUpdate: () => {
        const interpolated = lerp(this.smoothStartValue, this.smoothEndValue, this.chartTweenProgress);
        this.smoothedData[this.smoothedData.length - 1] = interpolated;
        this.drawChart(); // Redraw chart every frame of the tween for smooth motion.
      },
      onComplete: () => {
        this.smoothedData[this.smoothedData.length - 1] = this.smoothEndValue;
        this.drawChart(); // Ensure final value snaps exactly to the target.
        this.chartTween = null;
      }
    });
  }

  drawChart() {
    const data = this.smoothedData.length ? this.smoothedData : this.priceData;
    if (!data.length) return;

    const graphics = this.chartGraphics;
    graphics.clear(); // Clear previous frame before redrawing the animated chart.

    const max = Math.max(...data, this.roundStartPrice);
    const min = Math.min(...data, this.roundStartPrice);
    const range = Math.max(1, max - min);

    const points = data.map((value, index) => {
      const t = index / Math.max(1, data.length - 1); // Position along width (0→1).
      const x = t * this.chartWidth; // Convert parametric t into canvas X coord.
      const normalized = range === 0 ? 0.5 : (value - min) / range; // Normalise Y within min/max window.
      const y = this.chartHeight - normalized * this.chartHeight; // Invert so higher prices sit higher on screen.
      return { x, y, value };
    });

    const supportsGradient = typeof graphics.lineGradientStyle === 'function'; // Check for gradient support on this renderer.

    for (let i = 1; i < points.length; i += 1) {
      const prev = points[i - 1];
      const curr = points[i];
      const delta = curr.value - prev.value; // Per-segment price change for color/thickness mapping.
      const magnitude = Math.min(Math.abs(delta) / 2.5, 1); // Normalise volatility to 0-1 range.
      const lineWidth = lerp(MIN_LINE_THICKNESS, MAX_LINE_THICKNESS, magnitude); // Blend line width between calm and volatile values.
      const { startColor, endColor } = this.getSegmentColors(delta); // Retrieve gradient colours pre-brightened (~+25% luminance) for contrast.
      const glowColor = brightenColor(startColor, 1.1); // Slightly brighten the glow overlay for contrast.

      graphics.lineStyle(Math.max(lineWidth + 1.5, CHART_GLOW_WIDTH), glowColor, CHART_GLOW_ALPHA); // Simulated 2px blur via wider translucent stroke.
      graphics.beginPath();
      graphics.moveTo(prev.x, prev.y);
      graphics.lineTo(curr.x, curr.y);
      graphics.strokePath(); // Render glow pass before the main gradient stroke.

      if (supportsGradient) {
        graphics.lineGradientStyle(
          lineWidth,
          prev.x,
          prev.y,
          startColor,
          1,
          curr.x,
          curr.y,
          endColor,
          1
        ); // Apply segment gradient with volatility-adjusted thickness.
      } else {
        graphics.lineStyle(lineWidth, startColor, 1); // Canvas fallback uses the leading color for the segment.
      }

      graphics.beginPath(); // Start stroke for this segment.
      graphics.moveTo(prev.x, prev.y); // Move to previous sample point.
      graphics.lineTo(curr.x, curr.y); // Draw towards current sample point.
      graphics.strokePath(); // Render stroke immediately to keep memory footprint low.
    }

    const startValue = this.roundStartPrice;
    const lastValue = data[data.length - 1];
    const closingColor = lastValue >= startValue ? 0x00ff9d : 0xff4d4d;
    const baselineY = this.chartHeight - ((startValue - min) / range) * this.chartHeight; // Map round start to canvas Y.

    graphics.lineStyle(1, closingColor, 0.35); // Draw subtle baseline marker showing the round starting price.
    graphics.beginPath(); // Begin baseline path.
    graphics.moveTo(0, baselineY); // Baseline left anchor.
    graphics.lineTo(this.chartWidth, baselineY); // Baseline right anchor.
    graphics.strokePath(); // Draw baseline after main chart stroke.
  }

  drawChartCard() {
    if (!this.chartCard) return;
    this.chartCard.clear();
    this.chartCard.fillStyle(THEME.colors.bubbleFill, 0.82); // Reuse bubble tone for consistency.
    this.chartCard.fillRoundedRect(0, 0, this.chartWidth, this.chartHeight, 6); // Rounded corners for chart container.
    this.chartCard.lineStyle(2, THEME.colors.hudStroke, 0.45);
    this.chartCard.strokeRoundedRect(0, 0, this.chartWidth, this.chartHeight, 6); // Subtle outline to separate from background.
  }

  resolveRound({ dueToTimeout }) {
    if (!this.roundActive) return;
    this.roundActive = false;

    if (this.roundEvent) {
      this.roundEvent.remove(false);
      this.roundEvent = null;
    }

    const finalPrice = this.priceData[this.priceData.length - 1] ?? this.currentPrice;
    const outcome = finalPrice >= this.roundStartPrice ? 'up' : 'down';
    const predicted = this.roundPrediction;
    let roundMessage = '';

    if (!predicted) {
      this.streak = 0;
      roundMessage = dueToTimeout ? 'Time up! No prediction locked.' : 'No prediction — score unchanged.';
      this.sayBibi('noPrediction');
    } else if (predicted === outcome) {
      this.streak += 1;
      const multiplier = calculateMultiplier(this.streak);
      const points = Math.round(BASE_SCORE * multiplier);
      this.score += points;
      roundMessage = `Correct! +${points} (${outcome.toUpperCase()})`;
      this.sound.play('sfx_success', { volume: 0.45 });
      if (this.streak >= 3) {
        this.sayBibi('combo');
      } else {
        this.sayBibi('success');
      }
    } else {
      this.streak = 0;
      this.score = Math.max(0, this.score - FAIL_PENALTY);
      roundMessage = `Missed! It went ${outcome.toUpperCase()}. -${FAIL_PENALTY}`;
      this.sound.play('sfx_fail', { volume: 0.45 });
      this.sayBibi('fail');
    }

    this.updateChartGlow(); // Toggle glow effect based on fresh streak value.
    this.scoreDisplay.setScore(this.score);
    this.scoreDisplay.setStreak(this.streak);

    console.log(
      `[Round ${this.roundIndex}] Outcome=${outcome} Prediction=${predicted ?? 'none'} Score=${this.score} | ${roundMessage}`
    );

    this.disablePredictionButtons();

    if (this.timeRemainingMs > 0 && !dueToTimeout) {
      this.time.delayedCall(800, () => {
        if (this.timeRemainingMs > 0) {
          this.startRound();
        }
      });
    }
  }

  endGame() {
    if (!this.sessionActive) return;

    this.sessionActive = false;
    this.roundActive = false;
    this.timerDisplay.label.setVisible(false); // Hide timer once the session ends
    this.setPredictionButtonsVisible(false); // Hide buttons post-session per v7

    if (this.priceUpdateEvent) {
      this.priceUpdateEvent.remove(false);
      this.priceUpdateEvent = null;
    }

    if (this.timerTickEvent) {
      this.timerTickEvent.remove(false);
      this.timerTickEvent = null;
    }

    if (this.roundEvent) {
      this.roundEvent.remove(false);
      this.roundEvent = null;
    }

    this.disablePredictionButtons();

    this.sayBibi('sessionEnd');
    this.stopBgm();
    this.updateChartGlow(); // Ensure glow is removed when the session wraps up.

    this.time.delayedCall(
      1500,
      () => {
        this.scene.start('ResultScene', {
          score: this.score,
          selectedCoin: this.selectedCoin?.key ?? 'N/A',
          rounds: this.roundIndex
        });
      },
      null,
      this
    );
  }

  playChartIntroTween() {
    if (this.chartIntroTweens.length) {
      this.chartIntroTweens.forEach((tween) => tween.stop()); // Halt any previous round intro tweens to avoid conflicts.
      this.chartIntroTweens = [];
    }

    const fadeConfigs = [
      { target: this.chartCard, alpha: 0.8 },
      { target: this.chartGraphics, alpha: 1 }
    ].filter((entry) => entry.target);

    fadeConfigs.forEach(({ target, alpha }) => {
      target.setAlpha(0); // Reset alpha before the tween starts for a consistent fade.
      target.setScale(0.96); // Slightly shrink each object for a punchy ease-out.

      const tween = this.tweens.add({
        targets: target,
        alpha,
        scale: 1,
        duration: GRAPH_ALPHA_TWEEN_DURATION,
        ease: 'Quad.easeOut'
      });

      this.chartIntroTweens.push(tween); // Track so future rounds can stop them if needed.
    });
  }

  getSegmentColors(delta) {
    const intensity = Phaser.Math.Clamp(Math.abs(delta) / 4, 0, 1); // Normalise delta magnitude to emphasise larger moves.

    if (delta >= 0) {
      const start = lerpColor(0x00ff9d, 0xffffff, 0.25 + intensity * 0.1); // Brighten base up-trend green.
      const end = lerpColor(0x00ff9d, 0xffffff, 0.45 + intensity * 0.2); // Fade towards lighter green/yellow at the tip.
      return {
        startColor: brightenColor(colorToNumber(start), 1.1),
        endColor: brightenColor(colorToNumber(end), 1.15)
      }; // Upward segment gradient colors.
    }

    const start = lerpColor(0xff4d4d, 0xffffff, 0.2 + intensity * 0.1); // Brighten base down-trend red.
    const end = lerpColor(0xff4d4d, 0xffa0d8, 0.45 + intensity * 0.25); // Warm towards magenta for extra contrast.
    return {
      startColor: brightenColor(colorToNumber(start), 1.05),
      endColor: brightenColor(colorToNumber(end), 1.15)
    }; // Downward segment gradient colors.
  }

  updateChartGlow() {
    if (!this.chartGraphics || !this.chartGraphics.postFX || !this.chartGraphics.postFX.addGlow) return; // Skip when post-processing pipeline unavailable (e.g., Canvas renderer).

    const glowActive = this.streak >= COMBO_GLOW_THRESHOLD; // Determine if combo glow should be active.

    if (!this.chartGlowFx) {
      this.chartGlowFx = this.chartGraphics.postFX.addGlow(0x99fbff, 1.2, 0, true); // Baseline soft glow for readability.
    }

    if (glowActive) {
      const intensity = Phaser.Math.Clamp((this.streak - COMBO_GLOW_THRESHOLD) / 4, 0, 1); // Scale glow strength by streak depth.
      this.chartGlowFx.color = 0xfacc15; // Keep glow colour aligned with combo palette.
      this.chartGlowFx.outerStrength = lerp(2.5, 6, intensity); // Pulse outer glow to highlight streak progression.
      this.chartGlowFx.innerStrength = 0; // Keep glow soft to avoid obscuring the line detail.
      this.chartGlowFx.knockout = false;
      return;
    }

    this.chartGlowFx.color = 0x99fbff; // Mild cyan glow to boost contrast in normal play.
    this.chartGlowFx.outerStrength = 1.2; // Light touch glow to meet contrast requirement.
    this.chartGlowFx.innerStrength = 0;
    this.chartGlowFx.knockout = false;
  }

  sayBibi(lineKey, ...args) {
    if (!this.bibiDisplay) return;
    const entry = BIBI_LINES[lineKey];
    if (!entry) return;

    const payload = typeof entry === 'function' ? entry(...args) : entry;
    if (!payload?.text) return;

    const { voice = null, expression = null, revertAfter = undefined } = payload;
    this.bibiDisplay.speak(payload.text, voice, { expression, revertAfter });
  }

  playBgm() {
    if (this.bgm) {
      if (!this.bgm.isPlaying) {
        this.bgm.play();
      }
      return;
    }

    const audioCache = this.cache?.audio;
    if (!this.sound || !audioCache || !audioCache.exists('bgm_main')) {
      console.warn('[GameScene] Missing bgm_main audio asset. Skipping BGM playback.');
      return;
    }

    this.bgm = this.sound.add('bgm_main', { loop: true, volume: 0.25 });
    this.bgm.play();
  }

  stopBgm() {
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
    }
  }
}
