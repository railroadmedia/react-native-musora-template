export interface Reducer {
  (
    state: {},
    action: { type: string; cards?: { id: number }[]; card?: { id: number } }
  ): {};
}
export interface AddCards {
  (state: {}, cards: { id: number }[], cache?: boolean): {};
}
export interface UpdateCard {
  (state: {}, card: { id: number }): {};
}
export interface ToggleTheme {
  (theme: string): string;
}
export interface CardsContext {
  cards: {};
  addCards: (cards?: { id: number }[]) => void;
  addCardsAndCache: (cards?: { id: number }[]) => void;
  updateCard: (card?: { id: number }) => void;
}
export interface ThemeContext {
  theme: string;
  toggleTheme: () => void;
}
