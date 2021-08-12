import type { MethodReducer } from './MethodInterfaces';

export const SET_METHOD: string = 'SET_METHOD';
export const UPDATE_METHOD_LOADERS: string = 'UPDATE_METHOD_LOADERS';

export const methodReducer: MethodReducer = (
  state,
  { type, method, refreshing }
) => {
  let newState = {
    ...state,
    refreshing: refreshing === undefined ? state.refreshing : refreshing
  };
  switch (type) {
    case SET_METHOD:
      return { ...newState, method };
    case UPDATE_METHOD_LOADERS:
      return newState;
    default:
      return state;
  }
};
