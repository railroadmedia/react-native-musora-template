import type { Card } from './card.interfaces';
import type { Filters } from './service.interfaces';

export interface Show {
  thumbnailUrl: string;
  description: string;
  allowableFilters: string[];
  type: string;
}

export interface ShowLessons {
  data: Card[];
  meta?: { filterOptions: Filters };
}
