import Phaser from 'phaser';

const FONT_FILES = [
  { name: 'Orbitron-Bold', url: 'assets/fonts/Orbitron-Bold.ttf' },
  { name: 'Orbitron-Regular', url: 'assets/fonts/Orbitron-Regular.ttf' }
];

let fontPromise = null;
const loadOrbitronFonts = () => {
  if (fontPromise) return fontPromise;

  if (typeof window === 'undefined' || typeof window.FontFace === 'undefined') {
    console.warn('[BootScene] FontFace API unavailable; relying on fallback fonts.');
    fontPromise = Promise.resolve();
    return fontPromise;
  }

  fontPromise = Promise.all(
    FONT_FILES.map(({ name, url }) => {
      const face = new FontFace(name, `url(${url})`);
      return face
        .load()
        .then((loaded) => {
          document.fonts.add(loaded);
        })
        .catch((err) => {
          console.error(`[BootScene] Failed to load font ${name}`, err);
        });
    })
  ).then(() => {
    console.log('Orbitron fonts loaded');
  });

  return fontPromise;
};

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.setPath('assets');

    // HUD SFX
    this.load.audio('sfx_button', 'audio/tap_click.wav');
    this.load.audio('sfx_success', 'audio/success_ding.wav');
    this.load.audio('sfx_fail', 'audio/fail_pop.wav');

    // Character voice lines
    this.load.audio('voice_intro', 'audio/bibi_intro.mp3');
    this.load.audio('voice_coin_start', 'audio/bibi_coin_start.mp3');
    this.load.audio('voice_up', 'audio/bibi_call_up.mp3');
    this.load.audio('voice_down', 'audio/bibi_call_down.mp3');
    this.load.audio('voice_combo', 'audio/bibi_combo.mp3');
    this.load.audio('voice_fail', 'audio/bibi_fail.mp3');
    this.load.audio('voice_timeout', 'audio/bibi_timeout.mp3');

    // Background music
    this.load.audio('bgm_main', 'audio/lofi_coinbeat.mp3');

    // Character sprites
    this.load.image('bibi_idle', 'sprites/bibi_idle.png');
    this.load.image('bibi_talk', 'sprites/bibi_talk.png');
    this.load.image('bibi_happy', 'sprites/bibi_happy.png');
    this.load.image('bibi_sad', 'sprites/bibi_sad.png');

    // Font files (Phaser loader support where available) + FontFace fallback.
    if (typeof this.load.font === 'function') {
      this.load.font('Orbitron-Bold', 'fonts/Orbitron-Bold.ttf');
      this.load.font('Orbitron-Regular', 'fonts/Orbitron-Regular.ttf');
    }

    this.fontReady = loadOrbitronFonts();

    this.load.setPath();
  }

  async create() {
    if (this.fontReady) {
      await this.fontReady;
    }
    this.scene.start('MenuScene');
  }
}
