import type {
  ProfileReducer,
  UpdateNotif,
  UpdateUser
} from './ProfileInterfaces';

export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const SET_PROFILE = 'SET_PROFILE';

const updateUser: UpdateUser = (state, user) => ({
  user: { ...state, ...user }
});
const updateNotif: UpdateNotif = (state, notif) => ({
  notifications: [...(state || []), ...(notif || [])]
});

export const profileReducer: ProfileReducer = (
  state,
  { type, user, notifications, refreshing, loadingMore }
) => {
  const newState = {
    ...state,
    ...updateUser(state.user, user),
    refreshing: refreshing === undefined ? state.refreshing : refreshing,
    loadingMore: loadingMore === undefined ? state.loadingMore : loadingMore
  };
  switch (type) {
    case UPDATE_PROFILE:
      return {
        ...newState,
        ...updateNotif(state.notifications, notifications)
      };
    case SET_PROFILE:
      return { ...newState, notifications };
    default:
      return state;
  }
};
