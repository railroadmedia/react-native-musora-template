import type { Method } from './method.interfaces';

export interface CatalogueState {
  all?: number[];
  newContent?: number[];
  inProgress?: number[];
  recentlyViewed?: number[];
  method?: Method;
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
  method?: Method;
}

interface CatalogueAction {
  type?: string;
  scene?: string;
  cache?: CatalogueCache;
  all?: { id: number }[];
  newContent?: { id: number }[];
  inProgress?: { id: number }[];
  recentlyViewed?: { id: number }[];
  method?: Method;
  refreshing?: boolean;
  loadingMore?: boolean;
}
export interface CatalogueReducer {
  (state: CatalogueState, action: CatalogueAction): CatalogueState;
}
