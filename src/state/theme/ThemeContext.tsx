import { createContext } from 'react';

export interface ToggleTheme {
  (theme: string): string;
}

export interface IThemeContext {
  theme: string;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<IThemeContext>({
  theme: 'light',
  toggleTheme: () => {}
});
