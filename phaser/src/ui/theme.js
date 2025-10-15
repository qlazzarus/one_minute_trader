export const FONT_FAMILY = 'Orbitron-Regular, Orbitron-Bold, Arial, sans-serif';
export const FONT_FAMILY_BOLD = 'Orbitron-Bold, Orbitron-Regular, Arial, sans-serif';
export const FONT_COLOR = '#ffffff';
export const FONT_HIGHLIGHT = '#33e8ff';
export const FONT_SHADOW = '#00000080';

export const THEME = {
  colors: {
    background: 0x0d0d2b,
    hudOverlay: 0x000000,
    hudOverlayAlpha: 0.31,
    hudStroke: 0x0f2a4a,
    textPrimary: '#f5f5f5',
    textSecondary: '#5cefff',
    accent: '#33e8ff',
    highlight: '#00d5ff',
    bubbleFill: 0x0e1730,
    bubbleStroke: '#33e8ff',
    success: '#00ff9d',
    danger: '#ff4d4d'
  },
  fonts: {
    hud: {
      regular: 'Orbitron-Regular',
      bold: 'Orbitron-Bold',
      stackRegular: FONT_FAMILY,
      stackBold: FONT_FAMILY_BOLD,
      size: 24
    },
    bubble: {
      regular: 'Orbitron-Regular',
      stackRegular: FONT_FAMILY,
      size: 14
    },
    button: {
      stack: FONT_FAMILY_BOLD,
      size: 22
    }
  },
  shadows: {
    small: {
      offsetX: 1,
      offsetY: 1,
      color: '#000000',
      alpha: 0.5
    }
  },
  depths: {
    chartBackdrop: -0.2,
    chartCard: 0,
    chartLine: 1,
    hud: 2,
    bibi: 3,
    bubble: 4
  }
};
