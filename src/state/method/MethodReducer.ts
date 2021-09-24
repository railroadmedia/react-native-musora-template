import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MethodReducer } from '../../interfaces/method.interfaces';

export const UPDATE_METHOD = 'UPDATE_METHOD';

export const methodReducer: MethodReducer = (state, { type, method }) => {
  switch (type) {
    case UPDATE_METHOD:
      let newState = method ? { ...state, ...method } : state;
      AsyncStorage.setItem(`@method`, JSON.stringify(newState));
      return newState;
    default:
      return state;
  }
};
