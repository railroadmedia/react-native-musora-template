export interface CardsReducer {
  (
    state: {},
    action: { type: string; cards?: { id: number }[]; card?: { id: number } }
  ): {};
}
export interface UserReducer {
  (
    state: {},
    action: { type: string; user?: UserContext['user'] }
  ): UserContext['user'];
}
export interface AddCards {
  (state: {}, cards: { id: number }[], cache?: boolean): {};
}
export interface UpdateCard {
  (state: {}, card: { id: number }): {};
}
export interface UpdateUser {
  (state: {}, user: UserContext['user'], cache?: boolean): UserContext['user'];
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
export interface UserContext {
  user: {
    avatarUrl?: string;
    display_name?: string;
    totalXp?: string;
    xpRank?: string;
  };
  updateUser: (user: UserContext['user']) => void;
  updateUserAndCache: (user: UserContext['user']) => void;
}
export interface HeaderContext {
  headerNavHeight: number;
  updateHeaderNavHeight: (height: number) => void;
}
