import Phaser from 'phaser';

import { THEME, FONT_SHADOW } from '../ui/theme.js';
import { GameModes, setMode } from '../state/GameModeManager.js';

const MODE_TABS = [
  {
    mode: GameModes.MINING,
    label: 'Mining',
    scene: 'MiningScene',
    dialogue: '손가락 운동하자!'
  },
  {
    mode: GameModes.TRADING,
    label: 'Trading',
    scene: 'GameScene',
    dialogue: '오늘은 감으로 가볼래?'
  },
  {
    mode: GameModes.FARM,
    label: 'Farm',
    scene: 'FarmScene',
    dialogue: '농장 키우러 가자!'
  }
];

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
    this.selectedMode = GameModes.MINING;
    this.tabLabels = [];
  }

  create() {
    const { width, height } = this.scale;
    console.log('[Phase 1.3] MainMenuScene ready.');

    this.add.rectangle(width / 2, height / 2, width, height, THEME.colors.background, 0.92);

    // [Phase 1.3] Wallet summary header keeps economy info visible regardless of mode.
    const walletText = this.add
      .text(width / 2, 68, 'Wallet: 12,345 OMT', {
        fontFamily: THEME.fonts.hud.stackBold,
        fontSize: '22px',
        color: THEME.colors.textPrimary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    const tabsY = walletText.y + 48;
    this.createTabs(width, tabsY);
    this.createSettingsButton(width);

    // [Phase 1.3] Dialogue placeholder emulates Bibi presence until character UI is wired up.
    this.dialogueText = this.add
      .text(width / 2, height - 140, '', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: '20px',
        color: THEME.colors.textPrimary,
        align: 'center',
        wordWrap: { width: width - 80 }
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);

    setMode(GameModes.MINING);
    this.updateSelectedMode(GameModes.MINING);

    this.add
      .text(width / 2, height - 80, 'Select a mode to begin', {
        fontFamily: THEME.fonts.hud.stackRegular,
        fontSize: '18px',
        color: THEME.colors.textSecondary
      })
      .setOrigin(0.5)
      .setShadow(1, 1, FONT_SHADOW, 0, true, true);
  }

  createTabs(width, y) {
    const spacing = width / (MODE_TABS.length + 1);
    this.tabLabels = MODE_TABS.map((tab, index) => {
      const x = spacing * (index + 1);
      const label = this.add
        .text(x, y, tab.label, {
          fontFamily: THEME.fonts.hud.stackBold,
          fontSize: '20px',
          color: '#8fa5ff'
        })
        .setOrigin(0.5)
        .setShadow(1, 1, FONT_SHADOW, 0, true, true)
        .setInteractive({ useHandCursor: true });

      // [Phase 1.3] Tabs drive navigation to the appropriate scene for each mode.
      label.on('pointerdown', () => {
        this.updateSelectedMode(tab.mode);
        setMode(tab.mode);
        this.dialogueText.setText(tab.dialogue);
        console.log(`[Phase 1.3] Opening ${tab.scene} for mode: ${tab.mode}`);
        this.scene.start(tab.scene);
      });

      label.on('pointerover', () => {
        if (tab.mode !== this.selectedMode) {
          label.setAlpha(0.85);
        }
      });

      label.on('pointerout', () => {
        if (tab.mode !== this.selectedMode) {
          label.setAlpha(0.6);
        }
      });

      return { mode: tab.mode, label, config: tab };
    });

    this.updateTabStyles();
  }

  createSettingsButton(width) {
    // [Phase 1.3 UI] Add quick access to Settings in the top-right corner.
    this.add
      .text(width - 40, 40, '⚙️', {
        fontFamily: THEME.fonts.hud.stackBold,
        fontSize: '28px',
        color: '#ffffff'
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        console.log('[Phase 1.3 UI] Opening SettingsScene.');
        this.scene.start('SettingsScene');
      });
  }

  updateSelectedMode(mode) {
    this.selectedMode = mode;
    this.updateTabStyles();

    const tabConfig = MODE_TABS.find((entry) => entry.mode === mode);
    if (tabConfig) {
      this.dialogueText.setText(tabConfig.dialogue);
    }
  }

  updateTabStyles() {
    this.tabLabels.forEach(({ mode, label }) => {
      const isActive = mode === this.selectedMode;
      label.setColor(isActive ? THEME.colors.textPrimary : '#8fa5ff');
      label.setAlpha(isActive ? 1 : 0.6);
      label.setScale(isActive ? 1.1 : 1);
    });
  }
}
