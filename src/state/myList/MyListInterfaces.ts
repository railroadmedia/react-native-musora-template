export interface MyListState {
  myList?: number[];
  completed?: number[];
  inProgress?: number[];
  refreshing: boolean;
  loadingMore: boolean;
}
export interface Add {
  (
    currentItem: number[] | undefined,
    nextItem: { id: number }[] | undefined
  ): number[];
}

interface MyListCache {
  myList?: number[];
}

interface MyListAction {
  type: string;
  cache?: MyListCache;
  myList?: { id: number }[];
  completed?: { id: number }[];
  inProgress?: { id: number }[];
  refreshing?: boolean;
  loadingMore?: boolean;
  id?: number;
}
export interface MyListReducer {
  (state: MyListState, action: MyListAction): MyListState;
}
