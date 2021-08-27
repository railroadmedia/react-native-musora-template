export interface Theme {
  [theme: string]: {
    background?: string;
    textColor?: string;
    iconColor?: string;
    headerNavColor?: string;
    contrastBackground?: string;
    contrastTextColor?: string;
    borderColor?: string;
    textBoxColor?: string;
  };
}

export interface ToggleTheme {
  (theme: string): string;
}

export interface ThemeContext {
  theme: string;
  toggleTheme: () => void;
}
