export interface CardsReducer {
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

export interface ICardsContext {
  cards: { [key: number]: Card };
  addCards: (cards?: { id: number }[]) => void;
  addCardsAndCache: (cards?: { id: number }[]) => void;
  updateCard: (card?: { id: number }) => void;
}
