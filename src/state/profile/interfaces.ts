import type { UserContext } from '../interfaces';
import type { NotificationProps } from '../../profile/Notification';

export interface UpdateUser {
  (state: UserContext['user'] | undefined, user?: UserContext['user']): {
    user: UserContext['user'];
  };
}
export interface UpdateNotif {
  (
    state: NotificationProps[] | undefined,
    notifications?: NotificationProps[]
  ): {
    notifications: NotificationProps[];
  };
}
export interface NewState {
  loadingMore?: boolean;
  refreshing?: boolean;
  notifications?: NotificationProps[];
  user?: UserContext['user'];
}
export interface ProfileReducer {
  (state: NewState, action: { type: string } & NewState): NewState;
}
