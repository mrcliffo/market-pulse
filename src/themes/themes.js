/**
 * Built-in theme definitions
 */

export const themes = {
  default: {
    id: 'default',
    name: 'Market Pulse',
    colors: {
      primary: '#00b4ff',       // Bright blue
      secondary: '#ff6b2b',     // Orange accent
      tertiary: '#00d68f',      // Green

      surface: 'rgba(10, 10, 15, 0.95)',
      surfaceAlt: 'rgba(18, 18, 26, 0.95)',

      border: 'rgba(255, 107, 43, 0.3)',

      text: '#FFFFFF',
      textMuted: 'rgba(255, 255, 255, 0.7)',

      accent: '#ff6b2b',
      positive: '#00d68f',
      negative: '#ff4757',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  'united-home': {
    id: 'united-home',
    name: 'Manchester United',
    colors: {
      primary: '#DA291C',       // United red
      secondary: '#000000',     // Black
      tertiary: '#FFE500',      // Gold

      surface: 'rgba(0, 0, 0, 0.9)',
      surfaceAlt: 'rgba(30, 0, 0, 0.9)',

      border: 'rgba(218, 41, 28, 0.5)',

      text: '#FFFFFF',
      textMuted: '#CCCCCC',

      accent: '#FFE500',
      positive: '#22C55E',
      negative: '#EF4444',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  seahawks: {
    id: 'seahawks',
    name: 'Seattle Seahawks',
    colors: {
      primary: '#002244',       // Navy
      secondary: '#69BE28',     // Action green
      tertiary: '#A5ACAF',      // Wolf grey

      surface: 'rgba(0, 34, 68, 0.9)',
      surfaceAlt: 'rgba(0, 50, 100, 0.9)',

      border: 'rgba(105, 190, 40, 0.5)',

      text: '#FFFFFF',
      textMuted: '#A5ACAF',

      accent: '#69BE28',
      positive: '#69BE28',
      negative: '#EF4444',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  dark: {
    id: 'dark',
    name: 'Dark Mode',
    colors: {
      primary: '#6366F1',       // Indigo
      secondary: '#4F46E5',     // Darker indigo
      tertiary: '#818CF8',      // Light indigo

      surface: 'rgba(17, 24, 39, 0.95)',
      surfaceAlt: 'rgba(31, 41, 55, 0.95)',

      border: 'rgba(75, 85, 99, 0.5)',

      text: '#F9FAFB',
      textMuted: '#9CA3AF',

      accent: '#F59E0B',
      positive: '#10B981',
      negative: '#F43F5E',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  halloween: {
    id: 'halloween',
    name: 'Halloween',
    colors: {
      primary: '#F97316',       // Orange
      secondary: '#7C3AED',     // Purple
      tertiary: '#FBBF24',      // Yellow/gold

      surface: 'rgba(0, 0, 0, 0.95)',
      surfaceAlt: 'rgba(30, 10, 40, 0.9)',

      border: 'rgba(249, 115, 22, 0.5)',

      text: '#FAFAFA',
      textMuted: '#A1A1AA',

      accent: '#FBBF24',
      positive: '#22C55E',
      negative: '#DC2626',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  'midnight-terminal': {
    id: 'midnight-terminal',
    name: 'Midnight Terminal',
    colors: {
      primary: '#00FF88',       // Terminal green
      secondary: '#00D4AA',     // Teal
      tertiary: '#00B4D8',      // Cyan

      surface: 'rgba(0, 10, 8, 0.95)',
      surfaceAlt: 'rgba(0, 20, 16, 0.95)',

      border: 'rgba(0, 255, 136, 0.3)',

      text: '#E0FFF0',
      textMuted: 'rgba(224, 255, 240, 0.6)',

      accent: '#00FF88',
      positive: '#00FF88',
      negative: '#FF4757',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  'golden-hour': {
    id: 'golden-hour',
    name: 'Golden Hour',
    colors: {
      primary: '#F59E0B',       // Amber
      secondary: '#F97316',     // Orange
      tertiary: '#EAB308',      // Yellow

      surface: 'rgba(30, 20, 10, 0.95)',
      surfaceAlt: 'rgba(45, 30, 15, 0.95)',

      border: 'rgba(245, 158, 11, 0.4)',

      text: '#FFF8E7',
      textMuted: 'rgba(255, 248, 231, 0.7)',

      accent: '#F59E0B',
      positive: '#84CC16',
      negative: '#EF4444',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  'arctic-blue': {
    id: 'arctic-blue',
    name: 'Arctic Blue',
    colors: {
      primary: '#38BDF8',       // Sky blue
      secondary: '#0EA5E9',     // Deeper blue
      tertiary: '#7DD3FC',      // Light blue

      surface: 'rgba(8, 20, 35, 0.95)',
      surfaceAlt: 'rgba(12, 30, 50, 0.95)',

      border: 'rgba(56, 189, 248, 0.3)',

      text: '#F0F9FF',
      textMuted: 'rgba(240, 249, 255, 0.6)',

      accent: '#38BDF8',
      positive: '#34D399',
      negative: '#F87171',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  'neon-nights': {
    id: 'neon-nights',
    name: 'Neon Nights',
    colors: {
      primary: '#E879F9',       // Fuchsia
      secondary: '#A855F7',     // Purple
      tertiary: '#F472B6',      // Pink

      surface: 'rgba(20, 5, 25, 0.95)',
      surfaceAlt: 'rgba(35, 10, 45, 0.95)',

      border: 'rgba(232, 121, 249, 0.4)',

      text: '#FDF4FF',
      textMuted: 'rgba(253, 244, 255, 0.6)',

      accent: '#E879F9',
      positive: '#4ADE80',
      negative: '#FB7185',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },

  'carbon-fiber': {
    id: 'carbon-fiber',
    name: 'Carbon Fiber',
    colors: {
      primary: '#A3A3A3',       // Neutral gray
      secondary: '#737373',     // Darker gray
      tertiary: '#D4D4D4',      // Light gray

      surface: 'rgba(23, 23, 23, 0.95)',
      surfaceAlt: 'rgba(38, 38, 38, 0.95)',

      border: 'rgba(163, 163, 163, 0.3)',

      text: '#FAFAFA',
      textMuted: 'rgba(250, 250, 250, 0.6)',

      accent: '#E5E5E5',
      positive: '#22C55E',
      negative: '#EF4444',
    },
    fonts: {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },
};

export const themeList = Object.values(themes);
export const themeIds = Object.keys(themes);
export const defaultColors = themes.default.colors;
export const builtInThemes = themes;

// Labels for theme editor color pickers
export const colorLabels = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  surface: 'Surface',
  surfaceAlt: 'Surface Alt',
  border: 'Border',
  text: 'Text',
  textMuted: 'Text Muted',
  accent: 'Accent',
  positive: 'Positive',
  negative: 'Negative',
};

// Custom themes storage key
const CUSTOM_THEMES_KEY = 'market-pulse-custom-themes';

function getCustomThemes() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_THEMES_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCustomThemes(customThemes) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
}

export function getAllThemes() {
  return { ...themes, ...getCustomThemes() };
}

export function createTheme(id, name, colors) {
  const customThemes = getCustomThemes();
  customThemes[id] = {
    id,
    name,
    colors: { ...defaultColors, ...colors },
    fonts: themes.default.fonts,
    isCustom: true,
  };
  saveCustomThemes(customThemes);
  return customThemes[id];
}

export function updateTheme(id, updates) {
  const customThemes = getCustomThemes();
  if (customThemes[id]) {
    customThemes[id] = { ...customThemes[id], ...updates };
    saveCustomThemes(customThemes);
    return customThemes[id];
  }
  return null;
}

export function deleteTheme(id) {
  const customThemes = getCustomThemes();
  if (customThemes[id]) {
    delete customThemes[id];
    saveCustomThemes(customThemes);
    return true;
  }
  return false;
}

export function resetTheme(id) {
  return deleteTheme(id);
}

export function getTheme(id) {
  const allThemes = getAllThemes();
  return allThemes[id] || themes.default;
}
