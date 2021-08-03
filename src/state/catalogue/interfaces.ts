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
  (state: State, add: ({ id: number } | number)[]): State;
}
export interface AddMethod {
  (state: State, add: {}): State;
}
export interface Reducer {
  (
    state: State,
    action: {
      type: string;
      scene: string;
      all?: ({ id: number } | number)[];
      newContent?: ({ id: number } | number)[];
      inProgress?: ({ id: number } | number)[];
      recentlyViewed?: ({ id: number } | number)[];
      method?: {};
      refreshing?: boolean;
      loadingMore?: boolean;
    }
  ): State;
}
