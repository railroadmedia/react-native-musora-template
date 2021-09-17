import type { SeeAllReducer } from '../../interfaces/seeAll.interfaces';

export const ADD_CONTENT = 'ADD_CONTENT';
export const SET_CONTENT = 'SET_CONTENT';

export const seeAllReducer: SeeAllReducer = (
  state,
  { type, content, refreshing, loadingMore }
) => {
  const newState = {
    ...state,
    refreshing: refreshing === undefined ? state.refreshing : refreshing,
    loadingMore: loadingMore === undefined ? state.loadingMore : loadingMore
  };
  switch (type) {
    case ADD_CONTENT:
      return {
        ...newState,
        content: [...state.content, ...(content || [])?.map(c => c.id)]
      };
    case SET_CONTENT:
      return { ...newState, content: (content || [])?.map(c => c.id) };
    default:
      return newState;
  }
};
