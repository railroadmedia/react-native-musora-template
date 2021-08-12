import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Add, MyListReducer } from './MyListInterfaces';

export const SET_MY_LIST_FROM_CACHE: string = 'SET_MY_LIST_FROM_CACHE';
export const SET_IN_PROGRESS: string = 'SET_IN_PROGRESS';
export const SET_COMPLETED: string = 'SET_COMPLETED';
export const ADD_MY_LIST: string = 'ADD_MY_LIST';
export const ADD_COMPLETED: string = 'ADD_COMPLETED';
export const REMOVE_IN_PROGRESS: string = 'REMOVE_IN_PROGRESS';
export const REMOVE_MY_LIST: string = 'REMOVE_MY_LIST';
export const REMOVE_COMPLETED: string = 'REMOVE_COMPLETED';
export const ADD_IN_PROGRESS: string = 'ADD_IN_PROGRESS';
export const SET_MY_LIST_AND_CACHE: string = 'SET_MY_LIST_AND_CACHE';
export const UPDATE_MY_LIST_LOADERS: string = 'UPDATE_MY_LIST_LOADERS';

const add: Add = (currentItem, nextItem) => [
  ...(currentItem || []),
  ...(nextItem || []).map(ni => ni.id)
];

export const myListReducer: MyListReducer = (
  state,
  { type, id, myList, inProgress, completed, cache, refreshing, loadingMore }
) => {
  let newState = {
    ...state,
    refreshing: refreshing === undefined ? state.refreshing : refreshing,
    loadingMore: loadingMore === undefined ? state.loadingMore : loadingMore
  };
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
    case REMOVE_MY_LIST:
      return {
        ...newState,
        myList: newState.myList?.filter((ml: number) => ml !== id)
      };
    case REMOVE_IN_PROGRESS:
      return {
        ...newState,
        inProgress: newState.inProgress?.filter((ip: number) => ip !== id)
      };
    case REMOVE_COMPLETED:
      return {
        ...newState,
        completed: newState.completed?.filter((c: number) => c !== id)
      };
    default:
      return state;
  }
};
