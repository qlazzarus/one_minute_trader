import Phaser from 'phaser';

const FONT_FILES = [
  { name: 'Orbitron-Bold', url: 'assets/fonts/Orbitron-Bold.ttf' },
  { name: 'Orbitron-Regular', url: 'assets/fonts/Orbitron-Regular.ttf' }
];

let fontPromise = null;
const loadOrbitronFonts = () => {
  if (fontPromise) return fontPromise;

  if (typeof window === 'undefined' || typeof window.FontFace === 'undefined') {
    console.warn('[LoadingScene] FontFace API unavailable; relying on fallback fonts.');
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
          console.error(`[LoadingScene] Failed to load font ${name}`, err);
        });
    })
  ).then(() => {
    console.log('[LoadingScene] Orbitron fonts ready');
  });

  return fontPromise;
};

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  preload() {
    const { width, height } = this.scale;

    // [Phase 1.3 UI] Loading bar implementation.
    this.createLoadingUi(width, height);

    this.load.setPath('assets');

    // [Phase 1.3] Core audio assets for UI interactions and Bibi dialogues.
    this.load.audio('sfx_button', 'audio/tap_click.wav');
    this.load.audio('sfx_success', 'audio/success_ding.wav');
    this.load.audio('sfx_fail', 'audio/fail_pop.wav');

    const voiceMap = {
      start: ['audio/bibi_start_1.mp3', 'audio/bibi_start_2.mp3', 'audio/bibi_start_3.mp3'],
      round_start: ['audio/bibi_round_start_1.mp3', 'audio/bibi_round_start_2.mp3', 'audio/bibi_round_start_3.mp3'],
      round_warning: ['audio/bibi_round_warning_1.mp3', 'audio/bibi_round_warning_2.mp3', 'audio/bibi_round_warning_3.mp3'],
      round_result_win: ['audio/bibi_win_1.mp3', 'audio/bibi_win_2.mp3', 'audio/bibi_win_3.mp3'],
      round_result_combo: ['audio/bibi_combo_1.mp3', 'audio/bibi_combo_2.mp3', 'audio/bibi_combo_3.mp3'],
      round_result_lose: ['audio/bibi_lose_1.mp3', 'audio/bibi_lose_2.mp3', 'audio/bibi_lose_3.mp3'],
      round_last: ['audio/bibi_last_1.mp3', 'audio/bibi_last_2.mp3', 'audio/bibi_last_3.mp3'],
      game_end: ['audio/bibi_end_1.mp3', 'audio/bibi_end_2.mp3', 'audio/bibi_end_3.mp3']
    };
    const audioCategoryMap = {
      start: 'start',
      round_start: 'round_start',
      round_warning: 'round_warning',
      round_result_win: 'win',
      round_result_combo: 'combo',
      round_result_lose: 'lose',
      round_last: 'last',
      game_end: 'end'
    };
    Object.entries(voiceMap).forEach(([category, files]) => {
      const audioCategory = audioCategoryMap[category] ?? category;
      files.forEach((file, index) => {
        const key = `bibi_${audioCategory}_${index + 1}`;
        console.log(`[LoadingScene] Queueing voice asset: ${key} -> ${file}`);
        this.load.audio(key, file);
      });
    });

    // [Phase 1.3] Global background music and sprite assets used across modes.
    this.load.audio('bgm_main', 'audio/lofi_coinbeat.mp3');
    this.load.image('bibi_idle', 'sprites/bibi_idle.png');
    this.load.image('bibi_talk', 'sprites/bibi_talk.png');
    this.load.image('bibi_happy', 'sprites/bibi_happy.png');
    this.load.image('bibi_sad', 'sprites/bibi_sad.png');

    this.load.json('bibi_dialogues', 'dialogue/bibi_dialogues.json');

    if (typeof this.load.font === 'function') {
      this.load.font('Orbitron-Bold', 'fonts/Orbitron-Bold.ttf');
      this.load.font('Orbitron-Regular', 'fonts/Orbitron-Regular.ttf');
    }

    this.fontReady = loadOrbitronFonts();

    this.load.setPath();
    this.load.on(Phaser.Loader.Events.PROGRESS, this.handleProgress, this);
    this.load.once(Phaser.Loader.Events.COMPLETE, this.handleComplete, this);

    /*
    this.load.once(
      Phaser.Loader.Events.FILE_COMPLETE + '-image-bibi_idle',
      () => {
        const logo = this.add.image(width / 2, height * 0.4, 'bibi_idle').setAlpha(0);
        this.tweens.add({
          targets: logo,
          alpha: 1,
          duration: 600,
          ease: 'Sine.easeOut'
        });
      },
      this
    );
    */
  }

  async handleComplete() {
    this.load.off(Phaser.Loader.Events.PROGRESS, this.handleProgress, this);
    if (this.fontReady) {
      await this.fontReady;
    }
    console.log('[Phase 1.3] Loading complete. Starting MainMenuScene.');
    this.scene.start('MainMenuScene');
  }

  createLoadingUi(width, height) {
    const barWidth = 300;
    const barHeight = 20;
    const x = width / 2 - barWidth / 2;
    const y = height * 0.6;

    this.progressConfig = { x, y, width: barWidth, height: barHeight };

    this.progressBox = this.add.graphics();
    this.progressBox.lineStyle(2, 0xffffff, 0.6);
    this.progressBox.strokeRoundedRect(x, y, barWidth, barHeight, 10);

    this.progressBar = this.add.graphics();

    this.progressText = this.add
      .text(width / 2, y + 40, 'Loading... 0%', {
        fontFamily: 'Orbitron-Regular, Arial, sans-serif',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5);
  }

  handleProgress(value) {
    if (!this.progressBar || !this.progressConfig) return;
    const { x, y, width, height } = this.progressConfig;

    this.progressBar.clear();
    this.progressBar.fillStyle(0x33e8ff, 1);
    this.progressBar.fillRoundedRect(x + 3, y + 3, (width - 6) * value, height - 6, 8);

    if (this.progressText) {
      const percent = Math.floor(value * 100);
      this.progressText.setText(`Loading... ${percent}%`);
    }
  }
}
