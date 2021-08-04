export interface State {
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

interface Cache {
  all?: number[];
  newContent?: number[];
  inProgress?: number[];
  recentlyViewed?: number[];
  method?: {};
}

interface Action {
  type: string;
  scene: string;
  cache?: Cache;
  all?: { id: number }[];
  newContent?: { id: number }[];
  inProgress?: { id: number }[];
  recentlyViewed?: { id: number }[];
  method?: {};
  refreshing?: boolean;
  loadingMore?: boolean;
}
export interface Reducer {
  (state: State, action: Action): State;
}
