export interface State {
  all?: number[];
  newContent?: number[];
  inProgress?: number[];
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
      method?: {};
    },
    action: {
      type: string;
      scene: string;
      all?: [{ id: number }?];
      newContent?: [{ id: number }?];
      inProgress?: [{ id: number }?];
      method?: {};
    }
  ): State;
}
