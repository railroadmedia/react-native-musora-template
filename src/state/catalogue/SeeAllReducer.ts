import type { SeeAllReducer } from '../../interfaces/seeAll.interfaces';

export const ADD_CONTENT = 'ADD_CONTENT';

export const seeAllReducer: SeeAllReducer = (
  state,
  { type, content, refreshing, loadingMore }
) => {
  switch (type) {
    case ADD_CONTENT:
      return {
        content: [...state.content, ...(content || [])?.map(c => c.id)],
        refreshing: refreshing === undefined ? state.refreshing : refreshing,
        loadingMore: loadingMore === undefined ? state.loadingMore : loadingMore
      };
    default:
      return state;
  }
};
