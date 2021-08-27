import type { Notification } from './notification.interfaces';
import type { User } from './user.interfaces';

export interface UpdateUser {
  (state: User | undefined, user?: User): {
    user: User;
  };
}
export interface UpdateNotif {
  (state: Notification[] | undefined, notifications?: Notification[]): {
    notifications: Notification[];
  };
}
export interface ProfileState {
  loadingMore?: boolean;
  refreshing?: boolean;
  notifications?: Notification[];
  user?: User;
}
export interface ProfileReducer {
  (state: ProfileState, action: { type: string } & ProfileState): ProfileState;
}
