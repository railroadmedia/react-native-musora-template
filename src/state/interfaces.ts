import type { OrientationType } from 'react-native-orientation-locker';

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

export interface Card {
  artist: string;
  completed: boolean;
  head_shot_picture_url: string;
  id: number;
  instructors: string[];
  is_added_to_primary_playlist: boolean;
  length_in_seconds: number;
  like_count: number;
  name: string;
  progress_percent: number;
  published_on: string;
  started: boolean;
  status: string;
  style: string;
  thumbnail_url: string;
  title: string;
  type: string;
  live_event_start_time: string;
  live_event_end_time: string;
  level_number: number;
  sizeInBytes: number;
}

export interface CardsContext {
  cards: { [key: number]: Card };
  addCards: (cards?: { id: number }[]) => void;
  addCardsAndCache: (cards?: { id: number }[]) => void;
  updateCard: (card?: { id: number }) => void;
}
export interface ThemeContext {
  theme: string;
  toggleTheme: () => void;
}
export interface OrientationContext {
  orientation: OrientationType;
  isLandscape: boolean;
  updateOrientation: (orientation: OrientationType) => void;
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
