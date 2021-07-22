import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Add, Reducer, AddMethod } from './interfaces';

export const ADD_ALL = 'ADD_ALL';
export const ADD_NEW = 'ADD_NEW';
export const ADD_IN_PROGRESS = 'ADD_IN_PROGRESS';
export const ADD_METHOD = 'ADD_METHOD';
export const ADD_COMBINED = 'ADD_COMBINED';
export const ADD_COMBINED_AND_CACHE = 'ADD_COMBINED_AND_CACHE';

const addAll: Add = (state, all) => {
  const newState: (number | undefined)[] = [...state, ...all.map(a => a?.id)];
  return newState;
};

const addNew: Add = (state, newContent) => {
  const newState: (number | undefined)[] = [
    ...state,
    ...newContent.map(n => n?.id)
  ];
  return newState;
};

const addInProgress: Add = (state, inProgress) => {
  const newState: (number | undefined)[] = [
    ...state,
    ...inProgress.map(ip => ip?.id)
  ];
  return newState;
};

const addMethod: AddMethod = (state, method) => {
  const newState: {} = { ...state, method };
  return newState;
};

export const catalogueReducer: Reducer = (
  state,
  { type, scene, all, newContent, inProgress, method }
) => {
  switch (type) {
    case ADD_ALL:
      return all ? addAll(state.all || [], all) : state;
    case ADD_NEW:
      return newContent ? addNew(state.newContent || [], newContent) : state;
    case ADD_IN_PROGRESS:
      return inProgress
        ? addInProgress(state.inProgress || [], inProgress)
        : state;
    case ADD_METHOD:
      return method ? addMethod(state.method || {}, method) : state;
    case ADD_COMBINED:
      return {
        all: all?.map(a => a?.id || a) || [],
        newContent: newContent?.map(nc => nc?.id || nc) || [],
        inProgress: inProgress?.map(ip => ip?.id || ip) || [],
        method: method || {}
      };
    case ADD_COMBINED_AND_CACHE: {
      const newState = {
        all: all?.map(a => a?.id || a) || [],
        newContent: newContent?.map(nc => nc?.id || nc) || [],
        inProgress: inProgress?.map(ip => ip?.id || ip) || [],
        method: method || {}
      };
      AsyncStorage.setItem(`@${scene}`, JSON.stringify(newState));
      return newState;
    }
    default:
      return state;
  }
};
