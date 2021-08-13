export interface CardsReducer {
  (state: {}, action: { type: string; cards?: Card[]; card?: Card }): {};
}

export interface AddCards {
  (state: {}, cards: Card[], cache?: boolean): {};
}
export interface UpdateCard {
  (state: {}, card: Card): {};
}

export interface Card {
  artist?: string;
  completed?: boolean;
  head_shot_picture_url?: string;
  id: number;
  instructors?: string[];
  is_added_to_primary_playlist?: boolean;
  length_in_seconds?: number;
  like_count?: number;
  name?: string;
  progress_percent?: number;
  published_on: string;
  started?: boolean;
  status?: string;
  style?: string;
  thumbnail_url?: string;
  title?: string;
  type: string;
  live_event_start_time?: string;
  live_event_end_time?: string;
  level_number?: number;
  sizeInBytes?: number;
}

export interface ICardsContext {
  cards: { [key: number]: Card };
  addCards: (cards?: Card[]) => void;
  addCardsAndCache: (cards?: Card[]) => void;
  updateCard: (card?: Card) => void;
}
