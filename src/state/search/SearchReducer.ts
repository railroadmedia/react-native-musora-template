import type { Add, SearchReducer } from './SearchInterfaces';

export const ADD_SEARCH = 'ADD_SEARCH';
export const SET_SEARCH = 'SET_SEARCH';
export const UPDATE_SEARCH_LOADERS = 'UPDATE_SEARCH_LOADERS';

const add: Add = (currentItem, nextItem) => [
  ...(currentItem || []),
  ...(nextItem || []).map(ni => ni.id)
];

export const searchReducer: SearchReducer = (
  state,
  { type, searchResult, refreshing, loadingMore }
) => {
  let newState = {
    ...state,
    refreshing: refreshing === undefined ? state.refreshing : refreshing,
    loadingMore: loadingMore === undefined ? state.loadingMore : loadingMore
  };
  switch (type) {
    case ADD_SEARCH:
      return {
        ...newState,
        searchResult: add(newState.searchResult, searchResult)
      };
    case SET_SEARCH:
      return {
        ...newState,
        searchResult: (searchResult || []).map(ni => ni.id)
      };
    case UPDATE_SEARCH_LOADERS:
      return newState;
    default:
      return state;
  }
};
