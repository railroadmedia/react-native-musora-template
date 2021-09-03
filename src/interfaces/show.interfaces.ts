import type { Card } from './card.interfaces';

export interface Show {
  thumbnailUrl: string;
  description: string;
  allowableFilters: string[];
  type: string;
}

export interface ShowLessons {
  data: Card[];
}
