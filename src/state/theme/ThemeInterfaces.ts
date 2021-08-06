export interface ToggleTheme {
  (theme: string): string;
}

export interface IThemeContext {
  theme: string;
  toggleTheme: () => void;
}
