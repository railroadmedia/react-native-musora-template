import type { ShowCard } from './search.interfaces';

export interface CatalogueState {
  all?: number[];
  newContent?: number[];
  inProgress?: number[];
  recentlyViewed?: number[];
  refreshing: boolean;
  loadingMore: boolean;
}
export interface CatalogueAdd {
  (
    currentItem: number[] | undefined,
    nextItem: { id: number }[] | undefined
  ): number[];
}

interface CatalogueCache {
  all?: number[];
  newContent?: number[];
  inProgress?: number[];
  recentlyViewed?: number[];
}

interface CatalogueAction {
  type?: string;
  scene?: string;
  cache?: CatalogueCache;
  all?: { id: number }[] | ShowCard[];
  newContent?: { id: number }[];
  inProgress?: { id: number }[];
  recentlyViewed?: { id: number }[];
  refreshing?: boolean;
  loadingMore?: boolean;
}
export interface CatalogueReducer {
  (state: CatalogueState, action: CatalogueAction): CatalogueState;
}
