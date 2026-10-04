import { createContext, useContext } from 'react';
import type { Theme } from '@/lib/colors';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const THEME_STORAGE_KEY = 'cnn-explainer-theme';
