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
