import type { Notification } from './notification.interfaces';

export interface UpdateNotif {
  (state: Notification[] | undefined, notifications?: Notification[]): {
    notifications: Notification[];
  };
}
export interface ProfileState {
  loadingMore?: boolean;
  refreshing?: boolean;
  notifications?: Notification[];
}
export interface ProfileReducer {
  (state: ProfileState, action: { type: string } & ProfileState): ProfileState;
}
