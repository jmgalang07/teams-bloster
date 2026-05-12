import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'teams-bloster-theme';
const DEFAULT_THEME = 'dark';
const ALLOWED_THEMES = new Set(['dark', 'light']);

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (ALLOWED_THEMES.has(storedTheme)) {
      return storedTheme;
    }
  } catch {
    // Si localStorage falla, seguimos con la preferencia del sistema o el tema por defecto.
  }

  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : DEFAULT_THEME;
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const rootElement = document.documentElement;

    rootElement.dataset.theme = theme;
    rootElement.style.colorScheme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // No bloqueamos la app si localStorage esta deshabilitado.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const value = useMemo(
    () => ({
      theme,
      isDarkTheme: theme === 'dark',
      toggleTheme,
      setTheme,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }

  return context;
}
