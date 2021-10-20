export interface SearchState {
  searchResult?: number[];
  refreshing: boolean;
  loadingMore: boolean;
}
export interface AddSearch {
  (
    currentItem: number[] | undefined,
    nextItem: { id: number }[] | undefined
  ): number[];
}

interface SearchAction {
  type: string;
  searchResult?: { id: number }[];
  refreshing?: boolean;
  loadingMore?: boolean;
}
export interface SearchReducer {
  (state: SearchState, action: SearchAction): SearchState;
}

export interface ShowCard {
  id: number;
  thumbnailUrl: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  allowableFilters: string[];
}
