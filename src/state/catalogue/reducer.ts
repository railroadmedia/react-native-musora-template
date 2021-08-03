import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Add, Reducer, AddMethod } from './interfaces';

export const ADD_ALL = 'ADD_ALL';
export const ADD_NEW = 'ADD_NEW';
export const ADD_IN_PROGRESS = 'ADD_IN_PROGRESS';
export const ADD_RECENTLY_VIEWED = 'ADD_RECENTLY_VIEWED';
export const ADD_METHOD = 'ADD_METHOD';
export const ADD_COMBINED = 'ADD_COMBINED';
export const ADD_COMBINED_AND_CACHE = 'ADD_COMBINED_AND_CACHE';
export const UPDATE_CATALOGUE = 'UPDATE_CATALOGUE';

const addAll: Add = (state, all) => ({
  ...state,
  all: all.map(a => (typeof a === 'number' ? a : a.id))
});

const addNew: Add = (state, newContent) => ({
  ...state,
  newContent: newContent.map(nc => (typeof nc === 'number' ? nc : nc.id))
});

const addInProgress: Add = (state, inProgress) => ({
  ...state,
  inProgress: inProgress.map(ip => (typeof ip === 'number' ? ip : ip.id))
});

const addRecentlyViewed: Add = (state, recentlyViewed) => ({
  ...state,
  recentlyViewed: recentlyViewed.map(rv =>
    typeof rv === 'number' ? rv : rv.id
  )
});

const addMethod: AddMethod = (state, method) => ({ ...state, method });

export const catalogueReducer: Reducer = (
  state,
  {
    type,
    scene,
    all,
    newContent,
    inProgress,
    recentlyViewed,
    method,
    refreshing,
    loadingMore
  }
) => {
  let newState = {
    ...state,
    refreshing: refreshing === undefined ? state.refreshing : refreshing,
    loadingMore: loadingMore === undefined ? state.loadingMore : loadingMore
  };
  switch (type) {
    case ADD_ALL:
      return addAll(newState, all || []);
    case ADD_NEW:
      return addNew(newState, newContent || []);
    case ADD_IN_PROGRESS:
      return addInProgress(newState, inProgress || []);
    case ADD_RECENTLY_VIEWED:
      return addRecentlyViewed(newState, recentlyViewed || []);
    case ADD_METHOD:
      return addMethod(newState, method || {});
    case ADD_COMBINED:
      return {
        ...newState,
        all: all?.map(a => (typeof a === 'number' ? a : a.id)),
        newContent: newContent?.map(nc =>
          typeof nc === 'number' ? nc : nc.id
        ),
        inProgress: inProgress?.map(ip =>
          typeof ip === 'number' ? ip : ip.id
        ),
        recentlyViewed: recentlyViewed?.map(rv =>
          typeof rv === 'number' ? rv : rv.id
        ),
        method: method || {}
      };
    case ADD_COMBINED_AND_CACHE: {
      newState = {
        ...newState,
        all: all?.map(a => (typeof a === 'number' ? a : a.id)),
        newContent: newContent?.map(nc =>
          typeof nc === 'number' ? nc : nc.id
        ),
        inProgress: inProgress?.map(ip =>
          typeof ip === 'number' ? ip : ip.id
        ),
        recentlyViewed: recentlyViewed?.map(rv =>
          typeof rv === 'number' ? rv : rv.id
        ),
        method: method || {}
      };
      AsyncStorage.setItem(`@${scene}`, JSON.stringify(newState));
      return newState;
    }
    case UPDATE_CATALOGUE:
      return newState;
    default:
      return state;
  }
};
