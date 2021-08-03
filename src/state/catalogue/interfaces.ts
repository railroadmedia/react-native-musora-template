export interface State {
  all?: number[];
  newContent?: number[];
  inProgress?: number[];
  recentlyViewed?: number[];
  method?: {};
}
export interface Add {
  (state: number[], add: [{ id: number }?]): number[] | {};
}
export interface AddMethod {
  (state: {}, add: {}): {};
}
export interface Reducer {
  (
    state: {
      all?: number[];
      inProgress?: number[];
      newContent?: number[];
      recentlyViewed?: number[];
      method?: {};
    },
    action: {
      type: string;
      scene: string;
      all?: [{ id: number }?];
      newContent?: [{ id: number }?];
      inProgress?: [{ id: number }?];
      recentlyViewed?: [{ id: number }?];
      method?: {};
    }
  ): State;
}
