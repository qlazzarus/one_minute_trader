import Phaser from 'phaser';

const FALLBACK_LINE = '...';
const AUDIO_CATEGORY_MAP = {
  start: 'start',
  round_start: 'round_start',
  round_warning: 'round_warning',
  round_result_win: 'win',
  round_result_combo: 'combo',
  round_result_lose: 'lose',
  round_last: 'last',
  game_end: 'end'
};

export default class BibiDialogueManager {
  constructor(scene, jsonKey = 'bibi_dialogues') {
    this.scene = scene;
    this.dialogueKey = jsonKey;
    this.cache = null;
  }

  /**
   * Loads dialogue JSON from cache if available.
   */
  ensureLoaded() {
    if (this.cache) return;
    const data = this.scene.cache.json.get(this.dialogueKey);
    if (!data) {
      console.warn('[BibiDialogueManager] Dialogue JSON missing, using fallback lines.');
      this.cache = {};
    } else {
      this.cache = data;
    }
  }

  /**
   * Returns a random line for the given category.
   * @param {string} category
   * @returns {string}
   */
  say(category) {
    this.ensureLoaded();
    const lines = this.cache?.[category];
    if (!Array.isArray(lines) || lines.length === 0) {
      return FALLBACK_LINE;
    }
    return Phaser.Utils.Array.GetRandom(lines);
  }

  getRandomVoiceKey(category) {
    const audioCache = this.scene.cache?.audio;
    if (!audioCache || typeof audioCache.exists !== 'function') {
      console.warn('[BibiDialogueManager] audio cache unavailable, skipping voice playback.');
      return null;
    }

    const audioCategory = AUDIO_CATEGORY_MAP[category] ?? category;
    const variants = Phaser.Utils.Array.Shuffle([1, 2, 3]);
    console.debug('[BibiDialogueManager] Looking for voice variants', {
      category,
      audioCategory,
      variants,
      cacheKeys: Object.keys(audioCache.entries || {})
    });

    for (const variant of variants) {
      const key = `bibi_${audioCategory}_${variant}`;
      if (audioCache.exists(key)) {
        console.debug('[BibiDialogueManager] Selected voice key', key);
        return key;
      }
      console.warn(`[BibiDialogueManager] Voice key missing in cache: ${key}`);
    }

    console.warn(`[BibiDialogueManager] Missing voice variants for category: ${category}`);
    return null;
  }
}
