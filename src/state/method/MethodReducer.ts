import type { MethodReducer } from './MethodInterfaces';

export const SET_METHOD: string = 'SET_METHOD';
export const SET_LEVEL: string = 'SET_LEVEL';
export const UPDATE_METHOD_LOADERS: string = 'UPDATE_METHOD_LOADERS';

export const methodReducer: MethodReducer = (
  state,
  { type, method, level, refreshing }
) => {
  let newState = {
    ...state,
    refreshing: refreshing === undefined ? state.refreshing : refreshing
  };
  switch (type) {
    case SET_METHOD:
      return { ...newState, method };
    case SET_LEVEL:
      return { ...newState, level };
    case UPDATE_METHOD_LOADERS:
      return newState;
    default:
      return state;
  }
};
