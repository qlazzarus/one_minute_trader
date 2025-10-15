import Phaser from 'phaser';
import { THEME, FONT_COLOR, FONT_SHADOW } from '../ui/theme.js';

const DEFAULT_LINE = '오늘도 한탕 노려볼까?';
const TEXTURE_KEYS = ['bibi_idle', 'bibi_talk', 'bibi_happy', 'bibi_sad'];
const TARGET_HEIGHT_RATIO = 0.26;
const GLOW_PADDING = 14;
const BUBBLE_PADDING = 10;
const toColor = (value) =>
  typeof value === 'number' ? value : Phaser.Display.Color.HexStringToColor(value).color;

export default class BibiDisplay {
  constructor(scene, x = 80, y = null) {
    this.scene = scene;
    this.currentExpression = 'bibi_idle';
    this.resetEvent = null;

    const { width, height } = scene.scale;
    const anchorY = y ?? height - 60; // v6: place Bibi 60px above bottom edge.

    // Ensure all Bibi textures use nearest-neighbour filtering to avoid blur.
    TEXTURE_KEYS.forEach((key) => {
      if (scene.textures.exists(key)) {
        scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
      }
    });

    this.sprite = scene.add.sprite(x, anchorY, 'bibi_idle').setOrigin(0, 1); // Anchor bottom-left so Bibi sits flush per v6.

    const targetHeight = height * TARGET_HEIGHT_RATIO; // Scale based on v6 ratio.
    const scaleFactor = targetHeight / this.sprite.height;
    this.sprite.setScale(scaleFactor);

    if (typeof this.sprite.setScaleMode === 'function') {
      this.sprite.setScaleMode(Phaser.ScaleModes.NEAREST);
    }
    this.sprite.antialias = false;
    this.sprite.setDepth(3); // Ensure Bibi renders above chart and HUD.

    const spriteWidth = this.sprite.displayWidth;
    const spriteHeight = this.sprite.displayHeight;

    this.glow = scene.add
      .ellipse(
        x + spriteWidth / 2,
        anchorY - spriteHeight / 2,
        spriteWidth + GLOW_PADDING * 2,
        spriteHeight + GLOW_PADDING * 1.6,
        toColor(THEME.colors.highlight),
        0.2
      )
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(2.9); // Gentle additive glow slightly beneath the sprite.
    this.glow.setAlpha(0);

    this.sprite.setAlpha(0);
    scene.tweens.add({
      targets: [this.sprite, this.glow],
      alpha: 1,
      duration: 400,
      ease: 'Sine.easeInOut'
    }); // Gentle fade-in when Bibi appears.

    const bubbleX = x - 100;
    const bubbleY = anchorY - 160; // Position bubble beside Bibi per layout v6
    const bubbleWidth = 240;
    const bubbleHeight = 68;

    this.bubbleContainer = scene.add
      .container(bubbleX, bubbleY)
      .setDepth(THEME.depths.bubble); // Speech bubble floats beside Bibi per layout v6.

    const bubbleBg = scene.add
      .rectangle(0, 0, bubbleWidth, bubbleHeight, THEME.colors.bubbleFill, 0.8)
      .setOrigin(0.5);
    bubbleBg.setStrokeStyle(2, toColor(THEME.colors.bubbleStroke ?? '#33e8ff'));

    this.bubbleText = scene.add
      .text(0, 0, DEFAULT_LINE, {
        fontFamily: THEME.fonts.bubble.stackRegular,
        fontSize: `${THEME.fonts.bubble.size}px`,
        color: FONT_COLOR,
        align: 'center',
        wordWrap: { width: bubbleWidth - BUBBLE_PADDING * 2 }
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    this.bubbleContainer.add([bubbleBg, this.bubbleText]);
  }

  speak(text, voiceKey, { suppressVoice = false, expression, revertAfter } = {}) {
    this.bubbleText.setText(text);

    if (expression) {
      const duration = typeof revertAfter === 'number' ? revertAfter : expression === 'bibi_idle' ? null : 1400;
      this.setExpression(expression, { revertAfter: duration });
    }

    if (!suppressVoice && voiceKey) {
      this.playVoice(voiceKey);
    }
  }

  setExpression(expressionKey, { revertAfter = null, fallback = 'bibi_idle' } = {}) {
    const candidateKey = TEXTURE_KEYS.includes(expressionKey) ? expressionKey : `bibi_${expressionKey}`;
    const fallbackKey = TEXTURE_KEYS.includes(fallback) ? fallback : 'bibi_idle';
    const appliedKey = TEXTURE_KEYS.includes(candidateKey) ? candidateKey : fallbackKey;

    if (appliedKey && this.sprite.texture.key !== appliedKey) {
      this.sprite.setTexture(appliedKey);
    }

    this.currentExpression = appliedKey;
    this.clearResetEvent();

    if (revertAfter && revertAfter > 0) {
      this.resetEvent = this.scene.time.delayedCall(
        revertAfter,
        () => {
          this.setExpression(fallbackKey, { revertAfter: null });
        },
        null,
        this
      );
    }
  }

  playVoice(key) {
    if (!this.scene.sound) return;

    const audioCache = this.scene.cache?.audio;
    if (!audioCache || !audioCache.exists(key)) {
      return;
    }

    this.scene.sound.play(key, { volume: 0.65 });
  }

  clearResetEvent() {
    if (this.resetEvent) {
      this.resetEvent.remove(false);
      this.resetEvent = null;
    }
  }

  destroy() {
    this.clearResetEvent();
    this.sprite.destroy();
    this.glow.destroy();
    this.bubbleContainer.destroy(true);
  }
}
