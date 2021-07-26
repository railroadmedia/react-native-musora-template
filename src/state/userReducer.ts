import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserReducer, UpdateUser } from './interfaces';

export const UPDATE_USER_AND_CACHE = 'UPDATE_USER_AND_CACHE';
export const UPDATE_USER = 'UPDATE_USER';

const updateUser: UpdateUser = (state, user, cache) => {
  const newState = { ...state, ...user };
  if (cache) AsyncStorage.setItem('@user', JSON.stringify(newState));
  return newState;
};

export const userReducer: UserReducer = (state, { type, user }) => {
  switch (type) {
    case UPDATE_USER:
      return user ? updateUser(state, user) : state;
    case UPDATE_USER_AND_CACHE:
      return user ? updateUser(state, user, true) : state;
    default:
      return state;
  }
};
