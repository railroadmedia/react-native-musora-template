import type { NotificationProps } from '../../profile/Notification';
import type { IUserContext } from '../user/UserInterfaces';

export interface UpdateUser {
  (state: IUserContext['user'] | undefined, user?: IUserContext['user']): {
    user: IUserContext['user'];
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
  user?: IUserContext['user'];
}
export interface ProfileReducer {
  (state: NewState, action: { type: string } & NewState): NewState;
}
