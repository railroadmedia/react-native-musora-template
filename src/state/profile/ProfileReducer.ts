import type {
  ProfileReducer,
  UpdateNotif
} from '../../interfaces/profile.interfaces';

export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const SET_PROFILE = 'SET_PROFILE';

const updateNotif: UpdateNotif = (state, notif) => ({
  notifications: [...(state || []), ...(notif || [])]
});

export const profileReducer: ProfileReducer = (
  state,
  { type, notifications, refreshing, loadingMore }
) => {
  const newState = {
    ...state,
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
