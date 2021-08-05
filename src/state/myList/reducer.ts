import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Add, MyListReducer } from './interfaces';

export const SET_MY_LIST_FROM_CACHE = 'SET_MY_LIST_FROM_CACHE';
export const SET_IN_PROGRESS = 'SET_IN_PROGRESS';
export const SET_COMPLETED = 'SET_COMPLETED';
export const ADD_MY_LIST = 'ADD_MY_LIST';
export const ADD_COMPLETED = 'ADD_COMPLETED';
export const ADD_IN_PROGRESS = 'ADD_IN_PROGRESS';
export const SET_MY_LIST_AND_CACHE = 'SET_MY_LIST_AND_CACHE';
export const UPDATE_MY_LIST_LOADERS = 'UPDATE_MY_LIST_LOADERS';

const add: Add = (currentItem, nextItem) => [
  ...(currentItem || []),
  ...(nextItem || []).map(ni => ni.id)
];

export const myListReducer: MyListReducer = (
  state,
  { type, myList, inProgress, completed, cache, refreshing, loadingMore }
) => {
  let newState = {
    ...state,
    refreshing: refreshing === undefined ? state.refreshing : refreshing,
    loadingMore: loadingMore === undefined ? state.loadingMore : loadingMore
  };
  console.log('newState', newState);
  switch (type) {
    case ADD_MY_LIST:
      return { ...newState, myList: add(newState.myList, myList) };
    case ADD_COMPLETED:
      return { ...newState, completed: add(newState.completed, completed) };
    case ADD_IN_PROGRESS:
      return { ...newState, inProgress: add(newState.inProgress, inProgress) };
    case SET_MY_LIST_AND_CACHE: {
      let cachedState = {
        myList: (myList || []).map(ni => ni.id)
      };
      AsyncStorage.setItem(`@myList`, JSON.stringify(cachedState));
      return { ...newState, ...cachedState };
    }
    case SET_IN_PROGRESS:
      return { ...newState, inProgress: (inProgress || []).map(ni => ni.id) };
    case SET_COMPLETED:
      return { ...newState, completed: (completed || []).map(ni => ni.id) };
    case UPDATE_MY_LIST_LOADERS:
      return newState;
    case SET_MY_LIST_FROM_CACHE:
      return { ...newState, ...cache };
    default:
      return state;
  }
};
