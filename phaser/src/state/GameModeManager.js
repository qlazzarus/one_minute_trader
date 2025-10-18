export const GameModes = {
  MINING: 'mining',
  TRADING: 'trading',
  FARM: 'farm'
};

export let currentMode = GameModes.MINING;

export function setMode(mode) {
  currentMode = mode;
  // [Phase 1.3] Track mode transitions so scenes can react consistently.
  console.log('[GameModeManager] Mode set to:', mode);
}
