import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    // [Phase 1.3] Boot defers all asset work to LoadingScene to centralize the entry flow.
    console.log('[Phase 1.3] Boot complete. Transitioning to LoadingScene.');
    this.scene.start('LoadingScene');
  }
}
