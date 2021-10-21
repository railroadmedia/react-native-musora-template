import type { Card } from './card.interfaces';
import type { Filters } from './service.interfaces';

export interface Show {
  id: number;
  thumbnailUrl: string;
  description: string;
  allowableFilters: string[];
  type: string;
  name: string;
  icon: string;
}

export interface ShowLessons {
  data: Card[];
  meta?: { filterOptions: Filters };
}
