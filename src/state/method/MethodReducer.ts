import type { MethodReducer } from '../../interfaces/method.interfaces';

export const UPDATE_METHOD = 'UPDATE_METHOD';

export const methodReducer: MethodReducer = (state, { type, method }) => {
  switch (type) {
    case UPDATE_METHOD:
      return method ? { ...state, ...method } : state;
    default:
      return state;
  }
};
