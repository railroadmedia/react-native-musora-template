export interface CatalogueState {
  all?: number[];
  newContent?: number[];
  inProgress?: number[];
  recentlyViewed?: number[];
  method?: {};
  refreshing: boolean;
  loadingMore: boolean;
}
export interface Add {
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
  method?: {};
}

interface CatalogueAction {
  type: string;
  scene: string;
  cache?: CatalogueCache;
  all?: { id: number }[];
  newContent?: { id: number }[];
  inProgress?: { id: number }[];
  recentlyViewed?: { id: number }[];
  method?: {};
  refreshing?: boolean;
  loadingMore?: boolean;
}
export interface CatalogueReducer {
  (state: CatalogueState, action: CatalogueAction): CatalogueState;
}
