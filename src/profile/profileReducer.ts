import type { UserContext } from '../state/interfaces';
import type { NotificationProps } from './Notification';

export const UPDATE_PROFILE = 'UPDATE_PROFILE';
export const SET_PROFILE = 'SET_PROFILE';

interface UpdateUser {
  (state: UserContext['user'] | undefined, user?: UserContext['user']): {
    user: UserContext['user'];
  };
}
interface UpdateNotif {
  (
    state: NotificationProps[] | undefined,
    notifications?: NotificationProps[]
  ): {
    notifications: NotificationProps[];
  };
}
interface NewState {
  loadingMore?: boolean;
  refreshing?: boolean;
  notifications?: NotificationProps[];
  user?: UserContext['user'];
}
interface ProfileReducer {
  (state: NewState, action: { type: string } & NewState): NewState;
}

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
