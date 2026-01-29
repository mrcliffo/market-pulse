/**
 * Theme context and provider
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { themes, getTheme } from './themes.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children, defaultTheme = 'default' }) {
  const [themeId, setThemeId] = useState(defaultTheme);

  // Update theme when defaultTheme prop changes (from BroadcastChannel sync)
  useEffect(() => {
    if (defaultTheme && themes[defaultTheme]) {
      setThemeId(defaultTheme);
    }
  }, [defaultTheme]);

  const theme = useMemo(() => getTheme(themeId), [themeId]);

  const setTheme = useCallback((id) => {
    if (themes[id]) {
      setThemeId(id);
    }
  }, []);

  const value = useMemo(() => ({
    theme,
    themeId,
    setTheme,
    colors: theme.colors,
    fonts: theme.fonts || {
      heading: "'Oswald', sans-serif",
      body: "'Roboto', sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  }), [theme, themeId, setTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { themes, themeList, themeIds, getTheme } from './themes.js';
